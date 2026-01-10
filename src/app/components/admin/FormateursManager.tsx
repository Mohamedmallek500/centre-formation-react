import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useApp } from '../../context/AppContext';
import { Formateur } from '../../types';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export function FormateursManager() {
  const { state, addFormateur, updateFormateur, deleteFormateur } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFormateur, setEditingFormateur] = useState<Formateur | null>(null);
  const [formData, setFormData] = useState<Formateur>({
    id: '',
    nom: '',
    prenom: '',
    specialite: '',
    email: ''
  });

  const filteredFormateurs = state.formateurs.filter(formateur =>
    formateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formateur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formateur.specialite.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingFormateur) {
      updateFormateur(editingFormateur.id, formData);
      toast.success('Formateur modifié avec succès');
    } else {
      const newFormateur = { ...formData, id: `f${Date.now()}` };
      addFormateur(newFormateur);
      toast.success('Formateur ajouté avec succès');
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: '',
      nom: '',
      prenom: '',
      specialite: '',
      email: ''
    });
    setEditingFormateur(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (formateur: Formateur) => {
    setEditingFormateur(formateur);
    setFormData(formateur);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const coursCount = state.cours.filter(c => c.formateurId === id).length;
    if (coursCount > 0) {
      if (!confirm(`Ce formateur a ${coursCount} cours. Voulez-vous vraiment le supprimer ?`)) {
        return;
      }
    }
    deleteFormateur(id);
    toast.success('Formateur supprimé');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestion des Formateurs</CardTitle>
            <CardDescription>Gérer les formateurs du centre de formation</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un formateur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingFormateur ? 'Modifier le formateur' : 'Ajouter un formateur'}
                </DialogTitle>
                <DialogDescription>
                  Remplissez les informations du formateur
                </DialogDescription>
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
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom *</Label>
                    <Input
                      id="prenom"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialite">Spécialité *</Label>
                  <Input
                    id="specialite"
                    value={formData.specialite}
                    onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                    required
                    placeholder="ex: Informatique, Réseaux, IA..."
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingFormateur ? 'Modifier' : 'Ajouter'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un formateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Spécialité</TableHead>
                <TableHead>Nombre de cours</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFormateurs.map((formateur) => {
                const coursCount = state.cours.filter(c => c.formateurId === formateur.id).length;
                
                return (
                  <TableRow key={formateur.id}>
                    <TableCell className="font-medium">{formateur.nom}</TableCell>
                    <TableCell>{formateur.prenom}</TableCell>
                    <TableCell>{formateur.email}</TableCell>
                    <TableCell>{formateur.specialite}</TableCell>
                    <TableCell>{coursCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(formateur)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(formateur.id)}>
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

        {filteredFormateurs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun formateur trouvé
          </div>
        )}
      </CardContent>
    </Card>
  );
}
