import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { useApp } from '../../context/AppContext';
import { Seance } from '../../types';
import { Plus, Edit, Trash2, AlertTriangle, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';

export function PlanningManager() {
  const { state, addSeance, updateSeance, deleteSeance, checkConflits } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSeance, setEditingSeance] = useState<Seance | null>(null);
  const [conflits, setConflits] = useState<string[]>([]);
  const [formData, setFormData] = useState<Seance>({
    id: '',
    coursCode: '',
    date: '',
    heureDebut: '',
    heureFin: '',
    salle: '',
    groupeId: ''
  });

  const validateAndCheckConflits = (seanceData: Seance) => {
    const conflicts = checkConflits(seanceData, editingSeance?.id);
    setConflits(conflicts);
    return conflicts;
  };

  const handleFormChange = (updates: Partial<Seance>) => {
    const newFormData = { ...formData, ...updates };
    setFormData(newFormData);
    
    // Vérifier les conflits si on a toutes les infos nécessaires
    if (newFormData.date && newFormData.heureDebut && newFormData.heureFin && newFormData.salle) {
      validateAndCheckConflits(newFormData);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Valider les heures
    if (formData.heureDebut >= formData.heureFin) {
      toast.error('L\'heure de fin doit être après l\'heure de début');
      return;
    }
    
    const conflicts = validateAndCheckConflits(formData);
    
    if (conflicts.length > 0) {
      if (!confirm(`⚠️ Conflits détectés:\n${conflicts.join('\n')}\n\nVoulez-vous continuer quand même ?`)) {
        return;
      }
    }
    
    if (editingSeance) {
      updateSeance(editingSeance.id, formData);
      toast.success('Séance modifiée avec succès');
    } else {
      const newSeance = { ...formData, id: `se${Date.now()}` };
      addSeance(newSeance);
      toast.success('Séance ajoutée avec succès');
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: '',
      coursCode: '',
      date: '',
      heureDebut: '',
      heureFin: '',
      salle: '',
      groupeId: ''
    });
    setEditingSeance(null);
    setConflits([]);
    setIsDialogOpen(false);
  };

  const handleEdit = (seance: Seance) => {
    setEditingSeance(seance);
    setFormData(seance);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) {
      deleteSeance(id);
      toast.success('Séance supprimée');
    }
  };

  // Grouper les séances par date
  const seancesParDate = state.seances.reduce((acc, seance) => {
    if (!acc[seance.date]) {
      acc[seance.date] = [];
    }
    acc[seance.date].push(seance);
    return acc;
  }, {} as Record<string, Seance[]>);

  const dates = Object.keys(seancesParDate).sort();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Gestion du Planning
            </CardTitle>
            <CardDescription>
              Planifier les séances avec détection automatique des conflits
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une séance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSeance ? 'Modifier la séance' : 'Ajouter une séance'}
                </DialogTitle>
                <DialogDescription>
                  Les conflits d'horaires seront détectés automatiquement
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {conflits.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Conflits détectés :</strong>
                      <ul className="mt-2 list-disc list-inside">
                        {conflits.map((conflit, idx) => (
                          <li key={idx}>{conflit}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cours">Cours *</Label>
                    <Select
                      value={formData.coursCode}
                      onValueChange={(value) => handleFormChange({ coursCode: value })}
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="groupe">Groupe</Label>
                    <Select
                      value={formData.groupeId}
                      onValueChange={(value) => handleFormChange({ groupeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un groupe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucun</SelectItem>
                        {state.groupes.map(groupe => (
                          <SelectItem key={groupe.id} value={groupe.id}>
                            {groupe.nom} ({groupe.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleFormChange({ date: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="heureDebut">Heure de début *</Label>
                    <Input
                      id="heureDebut"
                      type="time"
                      value={formData.heureDebut}
                      onChange={(e) => handleFormChange({ heureDebut: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="heureFin">Heure de fin *</Label>
                    <Input
                      id="heureFin"
                      type="time"
                      value={formData.heureFin}
                      onChange={(e) => handleFormChange({ heureFin: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salle">Salle *</Label>
                  <Input
                    id="salle"
                    value={formData.salle}
                    onChange={(e) => handleFormChange({ salle: e.target.value })}
                    required
                    placeholder="ex: A101, B202..."
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingSeance ? 'Modifier' : 'Ajouter'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {dates.map(date => (
            <div key={date}>
              <h3 className="font-semibold mb-3 text-lg">
                {new Date(date).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Heure</TableHead>
                      <TableHead>Cours</TableHead>
                      <TableHead>Formateur</TableHead>
                      <TableHead>Salle</TableHead>
                      <TableHead>Groupe</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seancesParDate[date]
                      .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut))
                      .map((seance) => {
                        const cours = state.cours.find(c => c.code === seance.coursCode);
                        const formateur = state.formateurs.find(f => f.id === cours?.formateurId);
                        const groupe = state.groupes.find(g => g.id === seance.groupeId);
                        const hasConflits = checkConflits(seance, seance.id).length > 0;
                        
                        return (
                          <TableRow key={seance.id} className={hasConflits ? 'bg-red-50' : ''}>
                            <TableCell className="font-medium">
                              {seance.heureDebut} - {seance.heureFin}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{cours?.titre}</div>
                                <div className="text-sm text-gray-500">{cours?.code}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {formateur ? `${formateur.prenom} ${formateur.nom}` : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{seance.salle}</Badge>
                            </TableCell>
                            <TableCell>{groupe?.nom || '-'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                {hasConflits && (
                                  <AlertTriangle className="w-4 h-4 text-red-600" />
                                )}
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(seance)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(seance.id)}>
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
            </div>
          ))}

          {dates.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune séance planifiée</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
