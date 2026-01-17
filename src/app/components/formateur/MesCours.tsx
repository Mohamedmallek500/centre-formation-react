import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { useApp } from '../../context/AppContext';
import { Loader2, BookOpen } from 'lucide-react';
import { Cours } from '../../types';
import FormateurService from '../Services/formateur-services';

export function MesCours() {
  const { state } = useApp();
  const [cours, setCours] = useState<Cours[]>([]);
  const [loading, setLoading] = useState(true);

  const formateurId = state.currentUser?.id;

  useEffect(() => {
    if (formateurId) {
      loadCours();
    } else {
      setLoading(false);
    }
  }, [formateurId]);

  const loadCours = async () => {
    if (!formateurId) return;
    
    setLoading(true);
    try {
      const res = await FormateurService.getCoursByFormateur(formateurId);
      setCours(res.data || []);
    } catch (error) {
      console.error('Erreur chargement cours:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes cours</CardTitle>
        <CardDescription>Liste des cours que vous dispensez</CardDescription>
      </CardHeader>
      <CardContent>
        {cours.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Aucun cours assigné</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Durée</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cours.map((c) => (
                  <TableRow key={c.id || c.code}>
                    <TableCell className="font-medium">{c.code}</TableCell>
                    <TableCell>{c.titre}</TableCell>
                    <TableCell className="max-w-md truncate">{c.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{c.duree}h</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
