import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Inscription, Groupe, Etudiant } from '../../types';
import { Users, Search, CheckCircle, XCircle, Clock, UserCheck, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import InscriptionService from '../Services/inscription-services';
import GroupeService from '../Services/groupe-services';

export function InscriptionsManager() {
  // =========================
  // STATES
  // =========================
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [allInscriptions, setAllInscriptions] = useState<Inscription[]>([]);
  const [selectedGroupe, setSelectedGroupe] = useState<number | null>(null);
  const [selectedEtudiant, setSelectedEtudiant] = useState<Etudiant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('groupes');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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
  // CHARGER TOUTES LES INSCRIPTIONS (pour liste étudiants)
  // =========================
  useEffect(() => {
    if (activeTab === 'etudiant') {
      fetchAllInscriptions(page);
    }
  }, [activeTab, page, searchTerm]);

  const fetchAllInscriptions = async (pageNumber = 0) => {
    setLoading(true);
    try {
      const filters: any = {};
      if (searchTerm) filters.etudiant = searchTerm;

      const res = await InscriptionService.getAllPaginated(pageNumber, 12, filters);
      setAllInscriptions(res.data.content);
      setTotalPages(res.data.totalPages);
      setPage(res.data.number);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des inscriptions");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CHARGER INSCRIPTIONS PAR GROUPE
  // =========================
  const fetchInscriptionsByGroupe = async (groupeId: number) => {
    setLoading(true);
    try {
      const res = await InscriptionService.getByGroupe(groupeId);
      setInscriptions(res.data);
      setSelectedGroupe(groupeId);
      setSelectedEtudiant(null);
      setActiveTab('inscriptions');
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des inscriptions");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CHARGER INSCRIPTIONS PAR ÉTUDIANT
  // =========================
  const fetchInscriptionsByEtudiant = async (etudiant: Etudiant) => {
    setLoading(true);
    try {
      const res = await InscriptionService.getByEtudiant(etudiant.id);
      setInscriptions(res.data);
      setSelectedEtudiant(etudiant);
      setSelectedGroupe(null);
      setActiveTab('inscriptions');
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des inscriptions");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CHANGER STATUT INSCRIPTION
  // =========================
  const handleChangeStatut = async (inscriptionId: number, statut: 'VALIDEE' | 'REFUSEE') => {
    try {
      await InscriptionService.changerStatut(inscriptionId, statut);
      toast.success(`Inscription ${statut === 'VALIDEE' ? 'validée' : 'refusée'} avec succès`);

      // Recharger les inscriptions
      if (selectedGroupe) {
        fetchInscriptionsByGroupe(selectedGroupe);
      } else if (selectedEtudiant) {
        fetchInscriptionsByEtudiant(selectedEtudiant);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du changement de statut");
    }
  };

  // =========================
  // BADGE STATUT
  // =========================
  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'VALIDEE':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Validée</Badge>;
      case 'REFUSEE':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Refusée</Badge>;
      case 'EN_ATTENTE':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      default:
        return <Badge>{statut}</Badge>;
    }
  };

  // Extraire les étudiants uniques de toutes les inscriptions
  const uniqueEtudiants = Array.from(
    new Map(allInscriptions.map(i => [i.etudiant.id, i.etudiant])).values()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Inscriptions</CardTitle>
        <CardDescription>Gérer les inscriptions des étudiants par groupe ou par étudiant</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="groupes">
              <Users className="w-4 h-4 mr-2" />
              Par Groupe
            </TabsTrigger>
            <TabsTrigger value="etudiant">
              <GraduationCap className="w-4 h-4 mr-2" />
              Par Étudiant
            </TabsTrigger>
          </TabsList>

          {/* ========== ONGLET GROUPES ========== */}
          <TabsContent value="groupes" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupes.map((groupe) => (
                <Card
                  key={groupe.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => fetchInscriptionsByGroupe(groupe.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-600" />
                      {groupe.nom}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">
                      Voir les inscriptions
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {groupes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun groupe disponible
              </div>
            )}
          </TabsContent>

          {/* ========== ONGLET LISTE ÉTUDIANTS ========== */}
          <TabsContent value="etudiant" className="space-y-4">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par nom ou prénom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tableau des étudiants */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Groupe</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uniqueEtudiants.map((etudiant) => {
                    const inscription = allInscriptions.find(i => i.etudiant.id === etudiant.id);
                    return (
                      <TableRow key={etudiant.id}>
                        <TableCell className="font-medium">{etudiant.matricule}</TableCell>
                        <TableCell>{etudiant.nom}</TableCell>
                        <TableCell>{etudiant.prenom}</TableCell>
                        <TableCell>{etudiant.email}</TableCell>
                        <TableCell>{inscription?.groupe?.nom || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchInscriptionsByEtudiant(etudiant)}
                          >
                            Voir inscriptions
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-4 mt-4">
              <Button
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Précédent
              </Button>

              <span className="text-sm">
                Page {page + 1} / {totalPages || 1}
              </span>

              <Button
                variant="outline"
                disabled={page === totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Suivant
              </Button>
            </div>

            {uniqueEtudiants.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun étudiant trouvé
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* ========== TABLEAU DES INSCRIPTIONS ========== */}
        {activeTab === 'inscriptions' && inscriptions.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedGroupe
                  ? `Inscriptions du groupe ${groupes.find(g => g.id === selectedGroupe)?.nom}`
                  : `Inscriptions de ${selectedEtudiant?.prenom} ${selectedEtudiant?.nom}`
                }
              </h3>
              <Button variant="outline" onClick={() => {
                setInscriptions([]);
                setSelectedGroupe(null);
                setSelectedEtudiant(null);
                setActiveTab(selectedGroupe ? 'groupes' : 'etudiant');
              }}>
                Retour
              </Button>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Étudiant</TableHead>
                    <TableHead>Groupe</TableHead>
                    <TableHead>Date d'inscription</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inscriptions.map((inscription) => (
                    <TableRow key={inscription.id}>
                      <TableCell className="font-medium">#{inscription.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {inscription.etudiant?.prenom} {inscription.etudiant?.nom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {inscription.etudiant?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{inscription.groupe?.nom}</TableCell>
                      <TableCell>
                        {new Date(inscription.dateInscription).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>{getStatutBadge(inscription.statut)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {inscription.statut === 'EN_ATTENTE' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:bg-green-50"
                                onClick={() => handleChangeStatut(inscription.id as number, 'VALIDEE')}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Valider
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handleChangeStatut(inscription.id as number, 'REFUSEE')}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Refuser
                              </Button>
                            </>
                          )}
                          {inscription.statut !== 'EN_ATTENTE' && (
                            <span className="text-sm text-gray-400">
                              {inscription.statut === 'VALIDEE' ? 'Déjà validée' : 'Déjà refusée'}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Message si aucune inscription après recherche */}
        {activeTab === 'inscriptions' && inscriptions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <UserCheck className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Aucune inscription trouvée</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
