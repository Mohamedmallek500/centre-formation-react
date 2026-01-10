import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useApp } from '../../context/AppContext';
import { Specialite } from '../../types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function SpecialitesManager() {
  const { state, addSpecialite, updateSpecialite, deleteSpecialite } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSpecialite, setEditingSpecialite] = useState<Specialite | null>(null);
  const [formData, setFormData] = useState<Specialite>({
    id: '',
    nom: '',
    code: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSpecialite) {
      updateSpecialite(editingSpecialite.id, formData);
      toast.success('Spécialité modifiée avec succès');
    } else {
      const newSpecialite = { ...formData, id: `spec${Date.now()}` };
      addSpecialite(newSpecialite);
      toast.success('Spécialité ajoutée avec succès');
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: '',
      nom: '',
      code: '',
      description: ''
    });
    setEditingSpecialite(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (specialite: Specialite) => {
    setEditingSpecialite(specialite);
    setFormData(specialite);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette spécialité ?')) {
      deleteSpecialite(id);
      toast.success('Spécialité supprimée');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestion des Spécialités</CardTitle>
            <CardDescription>Créer et gérer les spécialités de formation</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une spécialité
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSpecialite ? 'Modifier la spécialité' : 'Ajouter une spécialité'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom *</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      required
                      placeholder="ex: Informatique"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                      placeholder="ex: INFO"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingSpecialite ? 'Modifier' : 'Ajouter'}
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
                <TableHead>Code</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Étudiants</TableHead>
                <TableHead>Cours</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.specialites.map((specialite) => {
                const etudiantsCount = state.etudiants.filter(e => e.specialiteId === specialite.id).length;
                const coursCount = state.cours.filter(c => c.specialiteId === specialite.id).length;
                
                return (
                  <TableRow key={specialite.id}>
                    <TableCell className="font-medium">{specialite.code}</TableCell>
                    <TableCell>{specialite.nom}</TableCell>
                    <TableCell className="max-w-md">{specialite.description}</TableCell>
                    <TableCell>{etudiantsCount}</TableCell>
                    <TableCell>{coursCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(specialite)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(specialite.id)}>
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
