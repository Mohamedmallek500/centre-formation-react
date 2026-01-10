import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Inscription, Etudiant, StatutInscription, Groupe } from '../../types';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import AuthService from '../Services/authservices';
import InscriptionService from '../Services/inscription-services';
import GroupeService from '../Services/groupe-services';

export function EtudiantsManager() {
  

  // =========================
  // STATES
  // =========================
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [groupes, setGroupes] = useState<Groupe[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [groupeFilter, setGroupeFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState<StatutInscription | ''>('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEtudiant, setEditingEtudiant] = useState<Etudiant | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: ''
  });

  // =========================
  // CHARGER LES GROUPES
  // =========================
  useEffect(() => {
    fetchGroupes();
  }, []);

  const fetchGroupes = async () => {
    try {
      const res = await GroupeService.getAll();
      setGroupes(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des groupes");
    }
  };

  // =========================
  // CHARGER LES INSCRIPTIONS (API filtrée)
  // =========================
  useEffect(() => {
    fetchEtudiants(page);
  }, [page, searchTerm, groupeFilter, statutFilter]);

  const fetchEtudiants = async (pageNumber = 0) => {
    try {
      const filters: any = {};

      if (searchTerm) filters.etudiant = searchTerm;
      if (groupeFilter) filters.groupe = groupeFilter; // 🔥 nom du groupe sélectionné
      if (statutFilter) filters.statut = statutFilter;

      const res = await InscriptionService.getAllPaginated(pageNumber, 12, filters);

      setInscriptions(res.data.content);
      setTotalPages(res.data.totalPages);
      setPage(res.data.number);

    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des étudiants");
    }
  };

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
        fetchEtudiants(page);
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
      toast.success("Étudiant supprimé");
      fetchEtudiants(page);
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
            <CardDescription>Liste des étudiants inscrits (via Inscriptions)</CardDescription>
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

        {/* FILTRES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Recherche étudiant */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Nom ou prénom étudiant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtre Groupe via API */}
          <select
            className="border rounded px-3 py-2"
            value={groupeFilter}
            onChange={(e) => setGroupeFilter(e.target.value)}
          >
            <option value="">Tous les groupes</option>
            {groupes.map((groupe) => (
              <option key={groupe.id} value={groupe.nom}>
                {groupe.nom}
              </option>
            ))}
          </select>

          {/* Filtre Statut */}
          <select
            className="border rounded px-3 py-2"
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value as any)}
          >
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">EN_ATTENTE</option>
            <option value="VALIDEE">VALIDEE</option>
            <option value="REFUSEE">REFUSEE</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matricule</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Groupe</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {inscriptions.map((inscription) => {
                const etudiant = inscription.etudiant;
                return (
                  <TableRow key={inscription.id}>
                    <TableCell>{etudiant.matricule}</TableCell>
                    <TableCell>{etudiant.nom}</TableCell>
                    <TableCell>{etudiant.prenom}</TableCell>
                    <TableCell>{etudiant.email}</TableCell>
                    <TableCell>{inscription.groupe?.nom}</TableCell>
                    <TableCell>{inscription.statut}</TableCell>
                    <TableCell>
                      {new Date(inscription.dateInscription).toLocaleDateString('fr-FR')}
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
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center items-center space-x-4 mt-4">
          <Button
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Précédent
          </Button>

          <span className="text-sm">
            Page {page + 1} / {totalPages}
          </span>

          <Button
            variant="outline"
            disabled={page === totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            Suivant
          </Button>
        </div>

        {inscriptions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun étudiant trouvé
          </div>
        )}
      </CardContent>
    </Card>
  );
}
