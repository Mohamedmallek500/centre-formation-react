import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { useApp } from '../../context/AppContext';
import { Calendar } from 'lucide-react';

export function MonEmploiDuTemps() {
  const { state } = useApp();
  const etudiant = state.etudiants.find(e => e.email === state.currentUser?.email);
  const matricule = etudiant?.matricule || '';
  
  const mesInscriptions = state.inscriptions.filter(i => 
    i.etudiantMatricule === matricule && i.statut === 'active'
  );
  
  const mesCoursCode = mesInscriptions.map(i => i.coursCode);
  
  const mesSeances = state.seances.filter(s => 
    mesCoursCode.includes(s.coursCode)
  );

  const seancesParDate = mesSeances.reduce((acc, seance) => {
    if (!acc[seance.date]) {
      acc[seance.date] = [];
    }
    acc[seance.date].push(seance);
    return acc;
  }, {} as Record<string, typeof mesSeances>);

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
                      <TableHead>Groupe</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seancesParDate[date]
                      .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut))
                      .map((seance) => {
                        const cours = state.cours.find(c => c.code === seance.coursCode);
                        const formateur = state.formateurs.find(f => f.id === cours?.formateurId);
                        const groupe = state.groupes.find(g => g.id === seance.groupeId);
                        
                        return (
                          <TableRow key={seance.id}>
                            <TableCell className="font-medium">
                              {seance.heureDebut} - {seance.heureFin}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{cours?.titre}</div>
                                <div className="text-sm text-gray-500">{cours?.code}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {formateur ? `${formateur.prenom} ${formateur.nom}` : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{seance.salle}</Badge>
                            </TableCell>
                            <TableCell>{groupe?.nom || '-'}</TableCell>
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
      </CardContent>
    </Card>
  );
}
