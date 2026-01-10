import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Etudiant } from '../../types';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import AuthService from '../Services/authservices';
import axios from '../Services/axios'; // ton axios configuré avec cookies

export function EtudiantsManager() {
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEtudiant, setEditingEtudiant] = useState<Etudiant | null>(null);

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: ''
  });

  // =========================
  // CHARGER LES ÉTUDIANTS
  // =========================
  useEffect(() => {
    fetchEtudiants();
  }, []);

  const fetchEtudiants = async () => {
    try {
      const res = await axios.get('/test/etudiants');
      setEtudiants(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des étudiants");
    }
  };

  // =========================
  // FILTRAGE
  // =========================
  const filteredEtudiants = etudiants.filter(etudiant =>
    etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    etudiant.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    etudiant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // =========================
  // SUBMIT (CREATE)
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEtudiant) {
        toast.info("La modification n’est pas encore exposée par ton backend");
      } else {
        await AuthService.signup({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          password: formData.password,
          role: "ETUDIANT"
        });

        toast.success("Étudiant ajouté avec succès");
        fetchEtudiants();
      }

      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l’enregistrement");
    }
  };

  // =========================
  // RESET
  // =========================
  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      password: ''
    });
    setEditingEtudiant(null);
    setIsDialogOpen(false);
  };

  // =========================
  // EDIT (UI ONLY)
  // =========================
  const handleEdit = (etudiant: Etudiant) => {
    setEditingEtudiant(etudiant);
    setFormData({
      nom: etudiant.nom,
      prenom: etudiant.prenom,
      email: etudiant.email,
      password: ''
    });
    setIsDialogOpen(true);
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) return;

    try {
      await axios.delete(`/test/etudiants/${id}`);
      toast.success("Étudiant supprimé");
      fetchEtudiants();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestion des Étudiants</CardTitle>
            <CardDescription>Ajouter et consulter les étudiants</CardDescription>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un étudiant
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingEtudiant ? "Modifier l’étudiant" : "Ajouter un étudiant"}
                </DialogTitle>
                <DialogDescription>
                  Renseignez les informations de l’étudiant
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nom</Label>
                    <Input
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label>Prénom</Label>
                    <Input
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                {!editingEtudiant && (
                  <div>
                    <Label>Mot de passe</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingEtudiant ? "Modifier" : "Ajouter"}
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un étudiant..."
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
                <TableHead>Matricule</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredEtudiants.map((etudiant) => (
                <TableRow key={etudiant.id}>
                  <TableCell>{etudiant.matricule}</TableCell>
                  <TableCell>{etudiant.nom}</TableCell>
                  <TableCell>{etudiant.prenom}</TableCell>
                  <TableCell>{etudiant.email}</TableCell>
                  <TableCell>
                    {new Date(etudiant.dateInscription).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(etudiant)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(etudiant.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredEtudiants.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun étudiant trouvé
          </div>
        )}
      </CardContent>
    </Card>
  );
}
