import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { useApp } from '../../context/AppContext';
import { Inscription, GroupeCours } from '../../types';
import { BookOpen, Loader2 } from 'lucide-react';
import InscriptionService from '../Services/inscription-services';
import GroupeCoursService from '../Services/groupe-cours-services';

export function MesCours() {
  const { state } = useApp();
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [groupeCoursList, setGroupeCoursList] = useState<GroupeCours[]>([]);
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
      // Charger les inscriptions de l'étudiant
      const inscRes = await InscriptionService.getByEtudiant(etudiantId);
      const inscData: Inscription[] = inscRes.data || [];
      setInscriptions(inscData);
      
      // Charger les cours de chaque groupe inscrit (validé)
      const validInscriptions = inscData.filter(i => i.statut === 'VALIDEE' || i.statut === 'active');
      const allGroupeCours: GroupeCours[] = [];
      
      for (const insc of validInscriptions) {
        if (insc.groupe?.id) {
          try {
            const gcRes = await GroupeCoursService.getByGroupe(insc.groupe.id);
            const coursWithGroupe = (gcRes.data || []).map((gc: GroupeCours) => ({
              ...gc,
              _groupe: insc.groupe // Ajouter le groupe pour l'affichage
            }));
            allGroupeCours.push(...coursWithGroupe);
          } catch (err) {
            console.error('Erreur chargement cours groupe:', err);
          }
        }
      }
      
      setGroupeCoursList(allGroupeCours);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const mesInscriptionsValidees = inscriptions.filter(i => 
    i.statut === 'VALIDEE' || i.statut === 'active'
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes cours</CardTitle>
        <CardDescription>Liste des cours auxquels vous êtes inscrit</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Formateur</TableHead>
                    <TableHead>Groupe</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupeCoursList.map((gc: any) => {
                    const cours = gc.cours;
                    const formateur = cours?.formateur;
                    const groupe = gc._groupe || gc.groupe;
                    
                    return (
                      <TableRow key={gc.id}>
                        <TableCell className="font-medium">{cours?.code}</TableCell>
                        <TableCell>{cours?.titre}</TableCell>
                        <TableCell className="max-w-md">{cours?.description || '-'}</TableCell>
                        <TableCell>
                          {formateur ? `${formateur.prenom} ${formateur.nom}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{groupe?.nom || '-'}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {groupeCoursList.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Vous n'êtes inscrit à aucun cours</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
