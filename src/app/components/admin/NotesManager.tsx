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
import { Note } from '../../types';
import { Plus, Edit, Trash2, Filter } from 'lucide-react';
import { toast } from 'sonner';

export function NotesManager() {
  const { state, addNote, updateNote, deleteNote } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [filterCours, setFilterCours] = useState('');
  const [formData, setFormData] = useState<Note>({
    id: '',
    valeur: 0,
    etudiantMatricule: '',
    coursCode: '',
    dateAttribution: new Date().toISOString().split('T')[0],
    commentaire: ''
  });

  const filteredNotes = state.notes.filter(note =>
    filterCours === '' || note.coursCode === filterCours
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.valeur < 0 || formData.valeur > 20) {
      toast.error('La note doit être entre 0 et 20');
      return;
    }
    
    if (editingNote) {
      updateNote(editingNote.id, formData);
      toast.success('Note modifiée avec succès');
    } else {
      const newNote = { ...formData, id: `n${Date.now()}` };
      addNote(newNote);
      toast.success('Note ajoutée avec succès');
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: '',
      valeur: 0,
      etudiantMatricule: '',
      coursCode: '',
      dateAttribution: new Date().toISOString().split('T')[0],
      commentaire: ''
    });
    setEditingNote(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData(note);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      deleteNote(id);
      toast.success('Note supprimée');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestion des Notes</CardTitle>
            <CardDescription>Attribuer et gérer les notes des étudiants</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingNote ? 'Modifier la note' : 'Ajouter une note'}
                </DialogTitle>
                <DialogDescription>
                  Attribuer une note à un étudiant pour un cours
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="etudiant">Étudiant *</Label>
                  <Select
                    value={formData.etudiantMatricule}
                    onValueChange={(value) => setFormData({ ...formData, etudiantMatricule: value })}
                    required
                    disabled={!!editingNote}
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
                    disabled={!!editingNote}
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valeur">Note /20 *</Label>
                    <Input
                      id="valeur"
                      type="number"
                      step="0.5"
                      min="0"
                      max="20"
                      value={formData.valeur}
                      onChange={(e) => setFormData({ ...formData, valeur: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date">Date d'attribution *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.dateAttribution}
                      onChange={(e) => setFormData({ ...formData, dateAttribution: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commentaire">Commentaire</Label>
                  <Textarea
                    id="commentaire"
                    value={formData.commentaire}
                    onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingNote ? 'Modifier' : 'Ajouter'}
                  </Button>
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
                <TableHead>Étudiant</TableHead>
                <TableHead>Cours</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Commentaire</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotes.map((note) => {
                const etudiant = state.etudiants.find(e => e.matricule === note.etudiantMatricule);
                const cours = state.cours.find(c => c.code === note.coursCode);
                
                return (
                  <TableRow key={note.id}>
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
                      <span className={`font-bold ${
                        note.valeur >= 10 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {note.valeur.toFixed(1)}/20
                      </span>
                    </TableCell>
                    <TableCell>{new Date(note.dateAttribution).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="max-w-xs truncate">{note.commentaire || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(note)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(note.id)}>
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

        {filteredNotes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucune note trouvée
          </div>
        )}
      </CardContent>
    </Card>
  );
}
