import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useApp } from '../../context/AppContext';
import { Session } from '../../types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function SessionsManager() {
  const { state, addSession, updateSession, deleteSession } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState<Session>({
    id: '',
    nom: '',
    dateDebut: '',
    dateFin: '',
    annee: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSession) {
      updateSession(editingSession.id, formData);
      toast.success('Session modifiée avec succès');
    } else {
      const newSession = { ...formData, id: `sess${Date.now()}` };
      addSession(newSession);
      toast.success('Session ajoutée avec succès');
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: '',
      nom: '',
      dateDebut: '',
      dateFin: '',
      annee: ''
    });
    setEditingSession(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
    setFormData(session);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      deleteSession(id);
      toast.success('Session supprimée');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestion des Sessions Pédagogiques</CardTitle>
            <CardDescription>Créer et gérer les semestres et années scolaires</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSession ? 'Modifier la session' : 'Ajouter une session'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom de la session *</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                    placeholder="ex: Semestre 1 - 2024/2025"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annee">Année scolaire *</Label>
                  <Input
                    id="annee"
                    value={formData.annee}
                    onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
                    required
                    placeholder="ex: 2024-2025"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateDebut">Date de début *</Label>
                    <Input
                      id="dateDebut"
                      type="date"
                      value={formData.dateDebut}
                      onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateFin">Date de fin *</Label>
                    <Input
                      id="dateFin"
                      type="date"
                      value={formData.dateFin}
                      onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingSession ? 'Modifier' : 'Ajouter'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Année</TableHead>
                <TableHead>Date de début</TableHead>
                <TableHead>Date de fin</TableHead>
                <TableHead>Cours associés</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.sessions.map((session) => {
                const coursCount = state.cours.filter(c => c.sessionId === session.id).length;
                
                return (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.nom}</TableCell>
                    <TableCell>{session.annee}</TableCell>
                    <TableCell>{new Date(session.dateDebut).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{new Date(session.dateFin).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{coursCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(session)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(session.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
