import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { useApp } from '../../context/AppContext';
import { Inscription } from '../../types';
import { Plus, Check } from 'lucide-react';
import { toast } from 'sonner';

export function CoursDisponibles() {
  const { state, addInscription } = useApp();
  const etudiant = state.etudiants.find(e => e.email === state.currentUser?.email);
  const matricule = etudiant?.matricule || '';
  
  const mesInscriptions = state.inscriptions.filter(i => 
    i.etudiantMatricule === matricule && i.statut === 'active'
  );
  
  const coursInscritsCode = mesInscriptions.map(i => i.coursCode);

  const handleInscrire = (coursCode: string) => {
    const newInscription: Inscription = {
      id: `ins${Date.now()}`,
      dateInscription: new Date().toISOString().split('T')[0],
      etudiantMatricule: matricule,
      coursCode: coursCode,
      statut: 'active'
    };
    
    addInscription(newInscription);
    toast.success('Inscription réussie');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cours disponibles</CardTitle>
        <CardDescription>Inscrivez-vous aux cours disponibles</CardDescription>
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
                <TableHead>Inscrits</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.cours.map((cours) => {
                const formateur = state.formateurs.find(f => f.id === cours.formateurId);
                const specialite = state.specialites.find(s => s.id === cours.specialiteId);
                const isInscrit = coursInscritsCode.includes(cours.code);
                
                return (
                  <TableRow key={cours.code}>
                    <TableCell className="font-medium">{cours.code}</TableCell>
                    <TableCell>{cours.titre}</TableCell>
                    <TableCell className="max-w-md">{cours.description}</TableCell>
                    <TableCell className="text-sm">
                      {formateur ? `${formateur.prenom} ${formateur.nom}` : '-'}
                    </TableCell>
                    <TableCell>
                      {specialite ? (
                        <Badge variant="secondary">{specialite.nom}</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{cours.etudiants.length}</TableCell>
                    <TableCell className="text-right">
                      {isInscrit ? (
                        <Badge variant="default" className="gap-1">
                          <Check className="w-3 h-3" />
                          Inscrit
                        </Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleInscrire(cours.code)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          S'inscrire
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {state.cours.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun cours disponible
          </div>
        )}
      </CardContent>
    </Card>
  );
}
