import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Formateur } from '../../types';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import FormateurService from '../Services/formateur-services';
import AuthService from '../Services/authservices';

// =========================
// TYPE POUR LE FORMULAIRE
// =========================
type FormateurForm = {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string;
  cin?: string;
  photo?: string;
  specialite: string;
};

export function FormateursManager() {

  // =========================
  // STATES
  // =========================
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFormateur, setEditingFormateur] = useState<Formateur | null>(null);

  const [formData, setFormData] = useState<FormateurForm>({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
    cin: '',
    photo: '',
    specialite: ''
  });

  // =========================
  // LOAD FORMATEURS
  // =========================
  useEffect(() => {
    fetchFormateurs();
  }, []);

  const fetchFormateurs = async () => {
    try {
      const res = await FormateurService.getAll();
      setFormateurs(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des formateurs");
    }
  };

  // =========================
  // FILTER
  // =========================
  const filteredFormateurs = formateurs.filter((formateur) =>
    formateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formateur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formateur.specialite?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // =========================
  // SUBMIT (CREATE / UPDATE)
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingFormateur) {
        // 🔄 UPDATE via /api/formateurs/{id}
        await FormateurService.update(editingFormateur.id, {
          ...editingFormateur, // garde role, roles, etc.
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          specialite: formData.specialite
        });

        toast.success("Formateur modifié avec succès");
      } else {
        // ➕ CREATE via /api/auth/signup
        await AuthService.signup({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          password: formData.password,
          telephone: formData.telephone,
          cin: formData.cin,
          photo: formData.photo,
          role: "FORMATEUR",
          specialite: formData.specialite
        });

        toast.success("Formateur ajouté avec succès");
      }

      fetchFormateurs();
      resetForm();

    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l’enregistrement du formateur");
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
      password: '',
      telephone: '',
      cin: '',
      photo: '',
      specialite: ''
    });
    setEditingFormateur(null);
    setIsDialogOpen(false);
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (formateur: Formateur) => {
    setEditingFormateur(formateur);
    setFormData({
      id: formateur.id,
      nom: formateur.nom,
      prenom: formateur.prenom,
      email: formateur.email,
      password: '',
      telephone: formateur.telephone || '',
      cin: formateur.cin || '',
      photo: formateur.photo || '',
      specialite: formateur.specialite
    });
    setIsDialogOpen(true);
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce formateur ?")) return;

    try {
      await FormateurService.delete(id);
      toast.success("Formateur supprimé");
      fetchFormateurs();
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
                  <div>
                    <Label>Nom *</Label>
                    <Input
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label>Prénom *</Label>
                    <Input
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                {!editingFormateur && (
                  <div>
                    <Label>Mot de passe *</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                )}

                <div>
                  <Label>Téléphone</Label>
                  <Input
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  />
                </div>

                <div>
                  <Label>CIN</Label>
                  <Input
                    value={formData.cin}
                    onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Photo</Label>
                  <Input
                    value={formData.photo}
                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                    placeholder="formateur.png"
                  />
                </div>

                <div>
                  <Label>Spécialité *</Label>
                  <Input
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
        {/* SEARCH */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un formateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Spécialité</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredFormateurs.map((formateur) => (
                <TableRow key={formateur.id}>
                  <TableCell className="font-medium">{formateur.nom}</TableCell>
                  <TableCell>{formateur.prenom}</TableCell>
                  <TableCell>{formateur.email}</TableCell>
                  <TableCell>{formateur.specialite}</TableCell>
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
              ))}
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
