import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { useApp } from '../../context/AppContext';
import { Inscription } from '../../types';
import { Plus, Trash2, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';

export function InscriptionsManager() {
  const { state, addInscription, deleteInscription } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCours, setFilterCours] = useState('');
  const [formData, setFormData] = useState({
    etudiantMatricule: '',
    coursCode: ''
  });

  const filteredInscriptions = state.inscriptions.filter(inscription =>
    filterCours === '' || inscription.coursCode === filterCours
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier si l'étudiant est déjà inscrit à ce cours
    const existingInscription = state.inscriptions.find(
      i => i.etudiantMatricule === formData.etudiantMatricule && 
           i.coursCode === formData.coursCode &&
           i.statut === 'active'
    );
    
    if (existingInscription) {
      toast.error('Cet étudiant est déjà inscrit à ce cours');
      return;
    }
    
    const newInscription: Inscription = {
      id: `ins${Date.now()}`,
      dateInscription: new Date().toISOString().split('T')[0],
      etudiantMatricule: formData.etudiantMatricule,
      coursCode: formData.coursCode,
      statut: 'active'
    };
    
    addInscription(newInscription);
    toast.success('Inscription créée avec succès');
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      etudiantMatricule: '',
      coursCode: ''
    });
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir annuler cette inscription ?')) {
      deleteInscription(id);
      toast.success('Inscription annulée');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestion des Inscriptions</CardTitle>
            <CardDescription>Inscrire les étudiants aux cours</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle inscription
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle inscription</DialogTitle>
                <DialogDescription>
                  Inscrire un étudiant à un cours
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="etudiant">Étudiant *</Label>
                  <Select
                    value={formData.etudiantMatricule}
                    onValueChange={(value) => setFormData({ ...formData, etudiantMatricule: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un étudiant" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.etudiants.map(etudiant => (
                        <SelectItem key={etudiant.matricule} value={etudiant.matricule}>
                          {etudiant.matricule} - {etudiant.prenom} {etudiant.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cours">Cours *</Label>
                  <Select
                    value={formData.coursCode}
                    onValueChange={(value) => setFormData({ ...formData, coursCode: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un cours" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.cours.map(cours => (
                        <SelectItem key={cours.code} value={cours.code}>
                          {cours.code} - {cours.titre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                  <Button type="submit">Inscrire</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={filterCours} onValueChange={setFilterCours}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filtrer par cours" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les cours</SelectItem>
              {state.cours.map(cours => (
                <SelectItem key={cours.code} value={cours.code}>
                  {cours.code} - {cours.titre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Étudiant</TableHead>
                <TableHead>Cours</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInscriptions.map((inscription) => {
                const etudiant = state.etudiants.find(e => e.matricule === inscription.etudiantMatricule);
                const cours = state.cours.find(c => c.code === inscription.coursCode);
                
                return (
                  <TableRow key={inscription.id}>
                    <TableCell>{new Date(inscription.dateInscription).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {etudiant?.prenom} {etudiant?.nom}
                        </div>
                        <div className="text-sm text-gray-500">{etudiant?.matricule}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{cours?.titre}</div>
                        <div className="text-sm text-gray-500">{cours?.code}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={inscription.statut === 'active' ? 'default' : 'secondary'}>
                        {inscription.statut === 'active' ? 'Active' : 'Annulée'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {inscription.statut === 'active' && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(inscription.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredInscriptions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucune inscription trouvée
          </div>
        )}
      </CardContent>
    </Card>
  );
}
