import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useApp } from '../../context/AppContext';
import { Groupe } from '../../types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';

export function GroupesManager() {
  const { state, addGroupe, updateGroupe, deleteGroupe } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroupe, setEditingGroupe] = useState<Groupe | null>(null);
  const [formData, setFormData] = useState<Groupe>({
    id: '',
    nom: '',
    type: 'TP',
    effectifMax: 20,
    etudiants: [],
    specialiteId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGroupe) {
      updateGroupe(editingGroupe.id, formData);
      toast.success('Groupe modifié avec succès');
    } else {
      const newGroupe = { ...formData, id: `grp${Date.now()}` };
      addGroupe(newGroupe);
      toast.success('Groupe ajouté avec succès');
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: '',
      nom: '',
      type: 'TP',
      effectifMax: 20,
      etudiants: [],
      specialiteId: ''
    });
    setEditingGroupe(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (groupe: Groupe) => {
    setEditingGroupe(groupe);
    setFormData(groupe);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      deleteGroupe(id);
      toast.success('Groupe supprimé');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestion des Groupes</CardTitle>
            <CardDescription>Créer et gérer les groupes d'étudiants (TP, TD, Cours)</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un groupe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingGroupe ? 'Modifier le groupe' : 'Ajouter un groupe'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom du groupe *</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      required
                      placeholder="ex: TP1, TD2..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: 'TP' | 'TD' | 'Cours') => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TP">TP</SelectItem>
                        <SelectItem value="TD">TD</SelectItem>
                        <SelectItem value="Cours">Cours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="effectifMax">Effectif maximum *</Label>
                  <Input
                    id="effectifMax"
                    type="number"
                    min="1"
                    value={formData.effectifMax}
                    onChange={(e) => setFormData({ ...formData, effectifMax: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialite">Spécialité</Label>
                  <Select
                    value={formData.specialiteId}
                    onValueChange={(value) => setFormData({ ...formData, specialiteId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une spécialité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucune</SelectItem>
                      {state.specialites.map(spec => (
                        <SelectItem key={spec.id} value={spec.id}>
                          {spec.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingGroupe ? 'Modifier' : 'Ajouter'}
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
                <TableHead>Type</TableHead>
                <TableHead>Spécialité</TableHead>
                <TableHead>Effectif</TableHead>
                <TableHead>Séances</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.groupes.map((groupe) => {
                const specialite = state.specialites.find(s => s.id === groupe.specialiteId);
                const seancesCount = state.seances.filter(s => s.groupeId === groupe.id).length;
                const effectifActuel = state.etudiants.filter(e => e.groupeId === groupe.id).length;
                
                return (
                  <TableRow key={groupe.id}>
                    <TableCell className="font-medium">{groupe.nom}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{groupe.type}</Badge>
                    </TableCell>
                    <TableCell>{specialite?.nom || '-'}</TableCell>
                    <TableCell>
                      <span className={effectifActuel > groupe.effectifMax ? 'text-red-600' : ''}>
                        {effectifActuel}/{groupe.effectifMax}
                      </span>
                    </TableCell>
                    <TableCell>{seancesCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(groupe)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(groupe.id)}>
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
