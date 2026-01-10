import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { useApp } from '../../context/AppContext';

export function MesCours() {
  const { state } = useApp();
  const etudiant = state.etudiants.find(e => e.email === state.currentUser?.email);
  const matricule = etudiant?.matricule || '';
  
  const mesInscriptions = state.inscriptions.filter(i => 
    i.etudiantMatricule === matricule && i.statut === 'active'
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes cours</CardTitle>
        <CardDescription>Liste des cours auxquels vous êtes inscrit</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Formateur</TableHead>
                <TableHead>Spécialité</TableHead>
                <TableHead>Session</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mesInscriptions.map((inscription) => {
                const cours = state.cours.find(c => c.code === inscription.coursCode);
                const formateur = state.formateurs.find(f => f.id === cours?.formateurId);
                const specialite = state.specialites.find(s => s.id === cours?.specialiteId);
                const session = state.sessions.find(s => s.id === cours?.sessionId);
                
                return (
                  <TableRow key={inscription.id}>
                    <TableCell className="font-medium">{cours?.code}</TableCell>
                    <TableCell>{cours?.titre}</TableCell>
                    <TableCell className="max-w-md">{cours?.description}</TableCell>
                    <TableCell>
                      {formateur ? `${formateur.prenom} ${formateur.nom}` : '-'}
                    </TableCell>
                    <TableCell>
                      {specialite ? (
                        <Badge variant="secondary">{specialite.nom}</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-sm">{session?.nom || '-'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {mesInscriptions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Vous n'êtes inscrit à aucun cours
          </div>
        )}
      </CardContent>
    </Card>
  );
}
