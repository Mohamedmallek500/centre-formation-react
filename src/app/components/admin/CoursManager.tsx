import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

import { Cours, Formateur } from "../../types";
import CoursService from "../Services/cours-services";
import FormateurService from "../Services/formateur-services";

export function CoursManager() {
  const [cours, setCours] = useState<Cours[]>([]);
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCours, setEditingCours] = useState<Cours | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    titre: "",
    description: "",
    nbHeures: 0,
    coefficient: 0,
    formateurId: "" // string dans le state, converti en number à l’envoi
  });

  // =========================
  // LOAD DATA
  // =========================
  const loadData = async () => {
    try {
      const [coursRes, formateursRes] = await Promise.all([
        CoursService.getAll(),
        FormateurService.getAll()
      ]);

      setCours(coursRes.data);
      setFormateurs(formateursRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du chargement des données");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // FILTER
  // =========================
  const filteredCours = cours.filter(c =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.formateurId) {
      toast.error("Veuillez sélectionner un formateur");
      return;
    }

    try {
      // ✅ FORMAT ATTENDU PAR TON BACKEND
      const payload = {
        code: formData.code,
        titre: formData.titre,
        description: formData.description,
        nbHeures: Number(formData.nbHeures),
        coefficient: Number(formData.coefficient),
        formateurId: Number(formData.formateurId) // 🔥 LA CORRECTION
      };

      console.log("Payload envoyé:", payload); // Debug

      if (editingCours) {
        await CoursService.update(editingCours.id, payload);
        toast.success("Cours modifié avec succès");
      } else {
        await CoursService.creer(payload);
        toast.success("Cours ajouté avec succès");
      }

      resetForm();
      loadData();
    } catch (error: any) {
      console.error("Erreur complète:", error);
      console.error("Réponse du serveur:", error.response?.data);
      const message = error.response?.data?.message || error.message || "Erreur lors de l'enregistrement";
      toast.error(message);
    }
  };

  // =========================
  // EDIT / DELETE
  // =========================
  const handleEdit = (cours: Cours) => {
    setEditingCours(cours);
    setFormData({
      code: cours.code,
      titre: cours.titre,
      description: cours.description || "",
      nbHeures: cours.nbHeures,
      coefficient: cours.coefficient,
      formateurId: cours.formateur?.id?.toString() || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce cours ?")) return;

    try {
      await CoursService.delete(id);
      toast.success("Cours supprimé");
      loadData();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      titre: "",
      description: "",
      nbHeures: 0,
      coefficient: 0,
      formateurId: ""
    });
    setEditingCours(null);
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestion des Cours</CardTitle>
            <CardDescription>Création / modification des cours</CardDescription>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un cours
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingCours ? "Modifier le cours" : "Ajouter un cours"}</DialogTitle>
                <DialogDescription>Renseignez les informations du cours</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Code *</Label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                      disabled={!!editingCours}
                    />
                  </div>

                  <div>
                    <Label>Titre *</Label>
                    <Input
                      value={formData.titre}
                      onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre d’heures *</Label>
                    <Input
                      type="number"
                      value={formData.nbHeures}
                      onChange={(e) =>
                        setFormData({ ...formData, nbHeures: Number(e.target.value) })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label>Coefficient *</Label>
                    <Input
                      type="number"
                      value={formData.coefficient}
                      onChange={(e) =>
                        setFormData({ ...formData, coefficient: Number(e.target.value) })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Formateur *</Label>
                  <Select
                    value={formData.formateurId}
                    onValueChange={(value) => setFormData({ ...formData, formateurId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un formateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {formateurs.map((f) => (
                        <SelectItem key={f.id} value={f.id.toString()}>
                          {f.prenom} {f.nom} - {f.specialite}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button>
                  <Button type="submit">{editingCours ? "Modifier" : "Ajouter"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher un cours..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Formateur</TableHead>
                <TableHead>Heures</TableHead>
                <TableHead>Coef</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredCours.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.code}</TableCell>
                  <TableCell>{c.titre}</TableCell>
                  <TableCell>
                    {c.formateur ? `${c.formateur.prenom} ${c.formateur.nom}` : "-"}
                  </TableCell>
                  <TableCell>{c.nbHeures}</TableCell>
                  <TableCell>{c.coefficient}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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
