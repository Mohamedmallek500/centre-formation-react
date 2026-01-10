import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useApp } from '../../context/AppContext';
import { BarChart3 } from 'lucide-react';

export function MesNotes() {
  const { state } = useApp();
  const etudiant = state.etudiants.find(e => e.email === state.currentUser?.email);
  const matricule = etudiant?.matricule || '';
  
  const mesNotes = state.notes.filter(n => n.etudiantMatricule === matricule);

  const moyenne = mesNotes.length > 0
    ? mesNotes.reduce((acc, n) => acc + n.valeur, 0) / mesNotes.length
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Mes notes</CardTitle>
            <CardDescription>Consulter vos résultats</CardDescription>
          </div>
          {mesNotes.length > 0 && (
            <div className="text-right">
              <div className="text-sm text-gray-500">Moyenne générale</div>
              <div className={`text-2xl font-bold ${
                moyenne >= 10 ? 'text-green-600' : 'text-red-600'
              }`}>
                {moyenne.toFixed(2)}/20
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cours</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Commentaire</TableHead>
                <TableHead>Formateur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mesNotes.map((note) => {
                const cours = state.cours.find(c => c.code === note.coursCode);
                const formateur = state.formateurs.find(f => f.id === cours?.formateurId);
                
                return (
                  <TableRow key={note.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{cours?.titre}</div>
                        <div className="text-sm text-gray-500">{cours?.code}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`text-xl font-bold ${
                          note.valeur >= 10 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {note.valeur.toFixed(1)}
                        </span>
                        <span className="text-gray-500">/20</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(note.dateAttribution).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="max-w-xs">{note.commentaire || '-'}</TableCell>
                    <TableCell className="text-sm">
                      {formateur ? `${formateur.prenom} ${formateur.nom}` : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {mesNotes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune note disponible</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
