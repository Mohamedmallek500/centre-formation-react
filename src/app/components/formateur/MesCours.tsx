import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { useApp } from '../../context/AppContext';
import { Users } from 'lucide-react';

export function MesCours() {
  const { state } = useApp();
  const formateurId = state.currentUser?.id || '';
  const mesCours = state.cours.filter(c => c.formateurId === formateurId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes cours</CardTitle>
        <CardDescription>Liste des cours que vous dispensez</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Spécialité</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Étudiants inscrits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mesCours.map((cours) => {
                const specialite = state.specialites.find(s => s.id === cours.specialiteId);
                const session = state.sessions.find(s => s.id === cours.sessionId);
                
                return (
                  <TableRow key={cours.code}>
                    <TableCell className="font-medium">{cours.code}</TableCell>
                    <TableCell>{cours.titre}</TableCell>
                    <TableCell className="max-w-md">{cours.description}</TableCell>
                    <TableCell>
                      {specialite ? (
                        <Badge variant="secondary">{specialite.nom}</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{session?.nom || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{cours.etudiants.length}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {mesCours.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun cours assigné
          </div>
        )}
      </CardContent>
    </Card>
  );
}
