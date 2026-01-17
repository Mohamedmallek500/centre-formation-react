import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { useApp } from '../../context/AppContext';
import { Note, Cours, TypeNote } from '../../types';
import { Plus, Edit, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import FormateurService from '../Services/formateur-services';
import NoteService from '../Services/note-services';
import InscriptionService from '../Services/inscription-services';

interface NoteFormData {
  valeur: number;
  typeNote: TypeNote;
  etudiantId: number | string;
  coursId: number | string;
}

export function GestionNotes() {
  const { state } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [selectedCours, setSelectedCours] = useState<string>('');
  const [cours, setCours] = useState<Cours[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [etudiants, setEtudiants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<NoteFormData>({
    valeur: 0,
    typeNote: 'DS',
    etudiantId: '',
    coursId: ''
  });

  const formateurId = state.currentUser?.id;

  useEffect(() => {
    if (formateurId) {
      loadCours();
    } else {
      setLoading(false);
    }
  }, [formateurId]);

  // Charger les notes quand un cours est sélectionné
  useEffect(() => {
    if (selectedCours) {
      loadNotesForCours(selectedCours);
      loadEtudiantsForCours(selectedCours);
    } else {
      setNotes([]);
      setEtudiants([]);
    }
  }, [selectedCours]);

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

  const loadNotesForCours = async (coursId: string) => {
    try {
      const res = await NoteService.getByCours(coursId);
      setNotes(res.data || []);
    } catch (error) {
      console.error('Erreur chargement notes:', error);
    }
  };

  const loadEtudiantsForCours = async (coursId: string) => {
    try {
      // Trouver le cours sélectionné
      const coursObj = cours.find(c => String(c.id) === coursId);
      if (coursObj && coursObj.groupeCours && coursObj.groupeCours.length > 0) {
        // Récupérer les étudiants des groupes liés au cours
        const allEtudiants: any[] = [];
        for (const gc of coursObj.groupeCours) {
          if (gc.groupe?.id) {
            try {
              const inscRes = await InscriptionService.getByGroupe(gc.groupe.id);
              const validInscriptions = (inscRes.data || []).filter(
                (i: any) => i.statut === 'VALIDEE' && i.etudiant
              );
              validInscriptions.forEach((i: any) => {
                if (!allEtudiants.find(e => e.id === i.etudiant.id)) {
                  allEtudiants.push(i.etudiant);
                }
              });
            } catch (err) {
              console.error('Erreur chargement inscriptions groupe:', err);
            }
          }
        }
        setEtudiants(allEtudiants);
      }
    } catch (error) {
      console.error('Erreur chargement étudiants:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.valeur < 0 || formData.valeur > 20) {
      toast.error('La note doit être entre 0 et 20');
      return;
    }
    
    if (!formData.coursId || !formData.etudiantId) {
      toast.error('Veuillez sélectionner un cours et un étudiant');
      return;
    }

    setSubmitting(true);
    try {
      if (editingNote) {
        // Mise à jour de la note
        await NoteService.update(editingNote.id, formData.valeur);
        toast.success('Note modifiée avec succès');
      } else {
        // Création d'une nouvelle note
        const noteRequest = {
          valeur: formData.valeur,
          typeNote: formData.typeNote,
          etudiantId: Number(formData.etudiantId),
          coursId: Number(formData.coursId)
        };
        await NoteService.create(noteRequest);
        toast.success('Note ajoutée avec succès');
      }
      
      // Recharger les notes
      if (selectedCours) {
        loadNotesForCours(selectedCours);
      }
      resetForm();
    } catch (error: any) {
      console.error('Erreur sauvegarde note:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      valeur: 0,
      typeNote: 'DS',
      etudiantId: '',
      coursId: selectedCours || ''
    });
    setEditingNote(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      valeur: note.valeur,
      typeNote: note.typeNote || 'DS',
      etudiantId: note.etudiant?.id || '',
      coursId: note.cours?.id || selectedCours || ''
    });
    setIsDialogOpen(true);
  };

  const handleOpenDialog = () => {
    if (!selectedCours) {
      toast.error('Veuillez d\'abord sélectionner un cours');
      return;
    }
    resetForm();
    setFormData(prev => ({ ...prev, coursId: selectedCours }));
    setIsDialogOpen(true);
  };

  const getTypeNoteLabel = (type: TypeNote) => {
    switch (type) {
      case 'DS': return 'Devoir Surveillé';
      case 'EXAM': return 'Examen';
      case 'TP': return 'Travaux Pratiques';
      default: return type;
    }
  };

  const getTypeNoteBadgeColor = (type: TypeNote) => {
    switch (type) {
      case 'DS': return 'bg-blue-100 text-blue-800';
      case 'EXAM': return 'bg-red-100 text-red-800';
      case 'TP': return 'bg-green-100 text-green-800';
      default: return '';
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
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestion des notes</CardTitle>
            <CardDescription>Saisir et modifier les notes de vos étudiants</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog} disabled={!selectedCours}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingNote ? 'Modifier la note' : 'Ajouter une note'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Cours</Label>
                  <div className="p-2 bg-gray-100 rounded text-sm">
                    {cours.find(c => String(c.id) === selectedCours)?.titre || 'Cours sélectionné'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="etudiant">Étudiant *</Label>
                  <Select
                    value={String(formData.etudiantId)}
                    onValueChange={(value) => setFormData({ ...formData, etudiantId: value })}
                    disabled={!!editingNote}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un étudiant" />
                    </SelectTrigger>
                    <SelectContent>
                      {etudiants.map(etudiant => (
                        <SelectItem key={etudiant.id} value={String(etudiant.id)}>
                          {etudiant.prenom} {etudiant.nom} ({etudiant.matricule || etudiant.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {etudiants.length === 0 && (
                    <p className="text-sm text-amber-600">Aucun étudiant inscrit dans les groupes de ce cours</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="typeNote">Type de note *</Label>
                  <Select
                    value={formData.typeNote}
                    onValueChange={(value) => setFormData({ ...formData, typeNote: value as TypeNote })}
                    disabled={!!editingNote}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DS">Devoir Surveillé (DS)</SelectItem>
                      <SelectItem value="EXAM">Examen</SelectItem>
                      <SelectItem value="TP">Travaux Pratiques (TP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valeur">Note /20 *</Label>
                  <Input
                    id="valeur"
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    value={formData.valeur}
                    onChange={(e) => setFormData({ ...formData, valeur: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingNote ? 'Modifier' : 'Ajouter'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <Label className="mb-2 block">Sélectionnez un cours pour gérer les notes</Label>
          <Select value={selectedCours} onValueChange={setSelectedCours}>
            <SelectTrigger className="w-full md:w-80">
              <SelectValue placeholder="Sélectionner un cours" />
            </SelectTrigger>
            <SelectContent>
              {cours.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.code} - {c.titre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!selectedCours ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Sélectionnez un cours pour voir et gérer les notes</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune note pour ce cours</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Étudiant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {note.etudiant?.prenom} {note.etudiant?.nom}
                        </div>
                        <div className="text-sm text-gray-500">
                          {note.etudiant?.matricule || note.etudiant?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeNoteBadgeColor(note.typeNote)}>
                        {getTypeNoteLabel(note.typeNote)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold text-lg ${
                        note.valeur >= 10 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {note.valeur.toFixed(1)}/20
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(note)}>
                        <Edit className="w-4 h-4" />
                      </Button>
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
