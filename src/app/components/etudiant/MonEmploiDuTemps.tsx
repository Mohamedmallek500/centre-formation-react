import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { useApp } from '../../context/AppContext';
import { Calendar, Loader2 } from 'lucide-react';
import { Inscription, Seance } from '../../types';
import InscriptionService from '../Services/inscription-services';
import SeanceService from '../Services/seance-services';

export function MonEmploiDuTemps() {
  const { state } = useApp();
  const [seances, setSeances] = useState<Seance[]>([]);
  const [loading, setLoading] = useState(true);

  const etudiantId = state.currentUser?.id;

  useEffect(() => {
    if (etudiantId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [etudiantId]);

  const loadData = async () => {
    if (!etudiantId) return;
    
    setLoading(true);
    try {
      // Charger les inscriptions validées de l'étudiant
      const inscRes = await InscriptionService.getByEtudiant(etudiantId);
      const inscriptions: Inscription[] = inscRes.data || [];
      const validInscriptions = inscriptions.filter(i => i.statut === 'VALIDEE' || i.statut === 'active');
      
      // Charger les séances de chaque groupe
      const allSeances: Seance[] = [];
      for (const insc of validInscriptions) {
        if (insc.groupe?.id) {
          try {
            const seanceRes = await SeanceService.getByGroupe(insc.groupe.id);
            allSeances.push(...(seanceRes.data || []));
          } catch (err) {
            console.error('Erreur chargement séances groupe:', err);
          }
        }
      }
      
      setSeances(allSeances);
    } catch (error) {
      console.error('Erreur chargement emploi du temps:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extraire la date de heureDebut (format ISO)
  const getDateFromSeance = (seance: Seance) => {
    if (seance.date) return seance.date;
    return seance.heureDebut?.split('T')[0] || '';
  };

  // Extraire l'heure de heureDebut et heureFin
  const formatHeure = (datetime: string) => {
    if (!datetime) return '';
    if (datetime.includes('T')) {
      return datetime.split('T')[1]?.substring(0, 5) || datetime;
    }
    return datetime;
  };

  const seancesParDate = seances.reduce((acc, seance) => {
    const date = getDateFromSeance(seance);
    if (!date) return acc;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(seance);
    return acc;
  }, {} as Record<string, Seance[]>);

  const dates = Object.keys(seancesParDate).sort();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Mon emploi du temps
        </CardTitle>
        <CardDescription>Vos séances de cours planifiées</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-6">
            {dates.map(date => (
              <div key={date}>
                <h3 className="font-semibold mb-3 text-lg">
                  {new Date(date).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Heure</TableHead>
                        <TableHead>Cours</TableHead>
                        <TableHead>Formateur</TableHead>
                        <TableHead>Salle</TableHead>
                        <TableHead>Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {seancesParDate[date]
                        .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut))
                        .map((seance) => {
                          const cours = seance.cours;
                          const formateur = cours?.formateur;
                          
                          return (
                            <TableRow key={seance.id}>
                              <TableCell className="font-medium">
                                {formatHeure(seance.heureDebut)} - {formatHeure(seance.heureFin)}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{cours?.titre || '-'}</div>
                                  <div className="text-sm text-gray-500">{cours?.code || '-'}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {formateur ? `${formateur.prenom} ${formateur.nom}` : '-'}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{seance.salle}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">{seance.typeSeance}</Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}

            {dates.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune séance planifiée</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
