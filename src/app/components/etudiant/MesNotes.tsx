import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { useApp } from '../../context/AppContext';
import { BarChart3, Loader2 } from 'lucide-react';
import { Note } from '../../types';
import NoteService from '../Services/note-services';

export function MesNotes() {
  const { state } = useApp();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const etudiantId = state.currentUser?.id;

  useEffect(() => {
    if (etudiantId) {
      loadNotes();
    } else {
      setLoading(false);
    }
  }, [etudiantId]);

  const loadNotes = async () => {
    if (!etudiantId) return;
    
    setLoading(true);
    try {
      const res = await NoteService.getByEtudiant(etudiantId);
      setNotes(res.data || []);
    } catch (error) {
      console.error('Erreur chargement notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const moyenne = notes.length > 0
    ? notes.reduce((acc, n) => acc + n.valeur, 0) / notes.length
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Mes notes</CardTitle>
            <CardDescription>Consulter vos résultats</CardDescription>
          </div>
          {notes.length > 0 && (
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
                    <TableHead>Cours</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Formateur</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notes.map((note) => {
                    const cours = note.cours;
                    const formateur = cours?.formateur;
                    
                    return (
                      <TableRow key={note.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{cours?.titre || '-'}</div>
                            <div className="text-sm text-gray-500">{cours?.code || '-'}</div>
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
                        <TableCell>
                          <Badge variant="outline">{note.typeNote}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formateur ? `${formateur.prenom} ${formateur.nom}` : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {notes.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune note disponible</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
