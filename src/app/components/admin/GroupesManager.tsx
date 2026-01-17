import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Groupe, GroupeCours, Cours } from '../../types';
import { Plus, Edit, Trash2, BookOpen, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import GroupeService from '../Services/groupe-services';
import GroupeCoursService from '../Services/groupe-cours-services';
import CoursService from '../Services/cours-services';

export function GroupesManager() {
  // =========================
  // STATES
  // =========================
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [allCours, setAllCours] = useState<Cours[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCoursDialogOpen, setIsCoursDialogOpen] = useState(false);
  const [editingGroupe, setEditingGroupe] = useState<Groupe | null>(null);
  const [selectedGroupe, setSelectedGroupe] = useState<Groupe | null>(null);
  const [groupeCours, setGroupeCours] = useState<GroupeCours[]>([]);

  const [formData, setFormData] = useState({
    nom: '',
    sessionId: 1
  });

  const [coursFormData, setCoursFormData] = useState({
    coursId: '',
    volumeHoraire: '',
    coefficient: ''
  });

  // Track course counts per group
  const [groupeCoursCount, setGroupeCoursCount] = useState<Record<number, number>>({});

  // =========================
  // CHARGER LES DONNÉES
  // =========================
  useEffect(() => {
    fetchGroupes();
    fetchCours();
  }, []);

  const fetchGroupes = async () => {
    try {
      const res = await GroupeService.getAll();
      setGroupes(res.data);

      // Charger le nombre de cours pour chaque groupe
      const counts: Record<number, number> = {};
      for (const groupe of res.data) {
        try {
          const coursRes = await GroupeCoursService.getByGroupe(groupe.id);
          counts[groupe.id] = coursRes.data.length;
        } catch (err) {
          counts[groupe.id] = 0;
        }
      }
      setGroupeCoursCount(counts);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des groupes");
    }
  };

  const fetchCours = async () => {
    try {
      const res = await CoursService.getAll();
      setAllCours(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des cours");
    }
  };

  // =========================
  // CHARGER LES COURS D'UN GROUPE
  // =========================
  const fetchGroupeCours = async (groupeId: number) => {
    try {
      const res = await GroupeCoursService.getByGroupe(groupeId);
      setGroupeCours(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des cours du groupe");
    }
  };

  // =========================
  // GESTION DES GROUPES
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingGroupe) {
        await GroupeService.modifier(editingGroupe.id, formData.nom, formData.sessionId);
        toast.success('Groupe modifié avec succès');
      } else {
        await GroupeService.creer(formData.nom, formData.sessionId);
        toast.success('Groupe ajouté avec succès');
      }
      fetchGroupes();
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      sessionId: 1
    });
    setEditingGroupe(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (groupe: Groupe) => {
    setEditingGroupe(groupe);
    setFormData({
      nom: groupe.nom,
      sessionId: groupe.sessionPedagogique?.id || 1
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) return;

    try {
      await GroupeService.supprimer(id);
      toast.success('Groupe supprimé');
      fetchGroupes();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression");
    }
  };

  // =========================
  // GESTION DES COURS DU GROUPE
  // =========================
  const handleOpenCoursDialog = async (groupe: Groupe) => {
    setSelectedGroupe(groupe);
    await fetchGroupeCours(groupe.id);
    setIsCoursDialogOpen(true);
  };

  const handleAddCours = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGroupe) return;

    try {
      await GroupeCoursService.create(
        selectedGroupe.id,
        parseInt(coursFormData.coursId),
        parseInt(coursFormData.volumeHoraire),
        parseFloat(coursFormData.coefficient)
      );

      toast.success('Cours affecté au groupe avec succès');
      fetchGroupeCours(selectedGroupe.id);
      // Update course count
      setGroupeCoursCount(prev => ({
        ...prev,
        [selectedGroupe.id]: (prev[selectedGroupe.id] || 0) + 1
      }));
      resetCoursForm();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'affectation du cours");
    }
  };

  const handleDeleteCours = async (groupeCoursId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce cours du groupe ?')) return;

    try {
      await GroupeCoursService.delete(groupeCoursId);
      toast.success('Cours retiré du groupe');
      if (selectedGroupe) {
        fetchGroupeCours(selectedGroupe.id);
        // Update course count
        setGroupeCoursCount(prev => ({
          ...prev,
          [selectedGroupe.id]: Math.max(0, (prev[selectedGroupe.id] || 0) - 1)
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetCoursForm = () => {
    setCoursFormData({
      coursId: '',
      volumeHoraire: '',
      coefficient: ''
    });
  };

  const closeCoursDialog = () => {
    setIsCoursDialogOpen(false);
    setSelectedGroupe(null);
    setGroupeCours([]);
    resetCoursForm();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestion des Groupes</CardTitle>
            <CardDescription>Créer et gérer les groupes et leurs cours</CardDescription>
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
                  <Label htmlFor="sessionId">Session pédagogique *</Label>
                  <Input
                    id="sessionId"
                    type="number"
                    value={formData.sessionId}
                    onChange={(e) => setFormData({ ...formData, sessionId: parseInt(e.target.value) })}
                    required
                  />
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
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Cours affectés</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupes.map((groupe) => (
                <TableRow key={groupe.id}>
                  <TableCell className="font-medium">#{groupe.id}</TableCell>
                  <TableCell>{groupe.nom}</TableCell>
                  <TableCell>{groupe.sessionPedagogique?.annee || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {groupeCoursCount[groupe.id] || 0} cours
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenCoursDialog(groupe)}
                      >
                        <BookOpen className="w-4 h-4 mr-1" />
                        Gérer cours
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(groupe)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(groupe.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {groupes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun groupe trouvé
          </div>
        )}
      </CardContent>

      {/* ========== DIALOG GESTION DES COURS ========== */}
      <Dialog open={isCoursDialogOpen} onOpenChange={setIsCoursDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Cours du groupe {selectedGroupe?.nom}
            </DialogTitle>
            <DialogDescription>
              Affecter et gérer les cours de ce groupe
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Formulaire d'ajout de cours */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Affecter un nouveau cours</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCours} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Cours *</Label>
                      <Select
                        value={coursFormData.coursId}
                        onValueChange={(value) => setCoursFormData({ ...coursFormData, coursId: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un cours" />
                        </SelectTrigger>
                        <SelectContent>
                          {allCours.map(cours => (
                            <SelectItem key={cours.id} value={cours.id.toString()}>
                              {cours.code} - {cours.titre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Volume horaire *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={coursFormData.volumeHoraire}
                        onChange={(e) => setCoursFormData({ ...coursFormData, volumeHoraire: e.target.value })}
                        placeholder="ex: 22"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Coefficient *</Label>
                      <Input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={coursFormData.coefficient}
                        onChange={(e) => setCoursFormData({ ...coursFormData, coefficient: e.target.value })}
                        placeholder="ex: 5"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">
                      <Plus className="w-4 h-4 mr-2" />
                      Affecter le cours
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Liste des cours affectés */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Cours affectés ({groupeCours.length})</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cours</TableHead>
                      <TableHead>Volume horaire</TableHead>
                      <TableHead>Coefficient</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupeCours.map((gc) => (
                      <TableRow key={gc.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{gc.cours?.titre}</div>
                            <div className="text-sm text-gray-500">{gc.cours?.code}</div>
                          </div>
                        </TableCell>
                        <TableCell>{gc.volumeHoraire}h</TableCell>
                        <TableCell>{gc.coefficient}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCours(gc.id)}
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {groupeCours.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucun cours affecté à ce groupe
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={closeCoursDialog}>
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
