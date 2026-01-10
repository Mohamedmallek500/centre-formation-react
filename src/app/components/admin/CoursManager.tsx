import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useApp } from '../../context/AppContext';
import { Cours } from '../../types';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';

export function CoursManager() {
  const { state, addCours, updateCours, deleteCours } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCours, setEditingCours] = useState<Cours | null>(null);
  const [formData, setFormData] = useState<Cours>({
    code: '',
    titre: '',
    description: '',
    formateurId: '',
    specialiteId: '',
    sessionId: '',
    etudiants: []
  });

  const filteredCours = state.cours.filter(cours =>
    cours.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cours.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cours.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCours) {
      updateCours(editingCours.code, formData);
      toast.success('Cours modifié avec succès');
    } else {
      if (state.cours.some(c => c.code === formData.code)) {
        toast.error('Ce code de cours existe déjà');
        return;
      }
      addCours(formData);
      toast.success('Cours ajouté avec succès');
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      code: '',
      titre: '',
      description: '',
      formateurId: '',
      specialiteId: '',
      sessionId: '',
      etudiants: []
    });
    setEditingCours(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (cours: Cours) => {
    setEditingCours(cours);
    setFormData(cours);
    setIsDialogOpen(true);
  };

  const handleDelete = (code: string) => {
    const inscriptionsCount = state.inscriptions.filter(i => i.coursCode === code).length;
    if (inscriptionsCount > 0) {
      if (!confirm(`Ce cours a ${inscriptionsCount} inscriptions. Voulez-vous vraiment le supprimer ?`)) {
        return;
      }
    }
    deleteCours(code);
    toast.success('Cours supprimé');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestion des Cours</CardTitle>
            <CardDescription>Créer et gérer les cours du centre</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un cours
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCours ? 'Modifier le cours' : 'Ajouter un cours'}
                </DialogTitle>
                <DialogDescription>
                  Remplissez les informations du cours
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Code du cours *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                      disabled={!!editingCours}
                      placeholder="ex: INF101"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="titre">Titre *</Label>
                    <Input
                      id="titre"
                      value={formData.titre}
                      onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                      required
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="formateur">Formateur *</Label>
                    <Select
                      value={formData.formateurId}
                      onValueChange={(value) => setFormData({ ...formData, formateurId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un formateur" />
                      </SelectTrigger>
                      <SelectContent>
                        {state.formateurs.map(formateur => (
                          <SelectItem key={formateur.id} value={formateur.id}>
                            {formateur.prenom} {formateur.nom} - {formateur.specialite}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session">Session</Label>
                  <Select
                    value={formData.sessionId}
                    onValueChange={(value) => setFormData({ ...formData, sessionId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une session" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucune</SelectItem>
                      {state.sessions.map(session => (
                        <SelectItem key={session.id} value={session.id}>
                          {session.nom}
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
                    {editingCours ? 'Modifier' : 'Ajouter'}
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
              placeholder="Rechercher un cours..."
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
                <TableHead>Code</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Formateur</TableHead>
                <TableHead>Spécialité</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Inscrits</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCours.map((cours) => {
                const formateur = state.formateurs.find(f => f.id === cours.formateurId);
                const specialite = state.specialites.find(s => s.id === cours.specialiteId);
                const session = state.sessions.find(s => s.id === cours.sessionId);
                
                return (
                  <TableRow key={cours.code}>
                    <TableCell className="font-medium">{cours.code}</TableCell>
                    <TableCell>{cours.titre}</TableCell>
                    <TableCell>
                      {formateur ? `${formateur.prenom} ${formateur.nom}` : '-'}
                    </TableCell>
                    <TableCell>
                      {specialite ? (
                        <Badge variant="secondary">{specialite.nom}</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{session?.nom || '-'}</TableCell>
                    <TableCell>{cours.etudiants.length}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(cours)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(cours.code)}>
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

        {filteredCours.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun cours trouvé
          </div>
        )}
      </CardContent>
    </Card>
  );
}
