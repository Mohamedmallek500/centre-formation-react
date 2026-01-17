import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { useApp } from '../../context/AppContext';
import { Groupe, Inscription, GroupeCours } from '../../types';
import { Plus, Check, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import InscriptionService from '../Services/inscription-services';
import GroupeService from '../Services/groupe-services';
import GroupeCoursService from '../Services/groupe-cours-services';

export function CoursDisponibles() {
  const { state } = useApp();
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [groupeCoursMap, setGroupeCoursMap] = useState<Record<number, GroupeCours[]>>({});
  const [loading, setLoading] = useState(true);
  const [inscribing, setInscribing] = useState<number | null>(null);
  
  const etudiantId = state.currentUser?.id;

  useEffect(() => {
    loadData();
  }, [etudiantId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger tous les groupes disponibles
      const groupesRes = await GroupeService.getAll();
      const groupesList: Groupe[] = groupesRes.data || [];
      setGroupes(groupesList);
      
      // Charger les cours de chaque groupe
      const coursMap: Record<number, GroupeCours[]> = {};
      for (const groupe of groupesList) {
        try {
          const gcRes = await GroupeCoursService.getByGroupe(groupe.id);
          coursMap[groupe.id] = gcRes.data || [];
        } catch (err) {
          coursMap[groupe.id] = [];
        }
      }
      setGroupeCoursMap(coursMap);
      
      // Charger les inscriptions de l'étudiant si connecté
      if (etudiantId) {
        const inscRes = await InscriptionService.getByEtudiant(etudiantId);
        setInscriptions(inscRes.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  // IDs des groupes auxquels l'étudiant est déjà inscrit
  const groupesInscritsIds = inscriptions.map(i => i.groupe?.id).filter(Boolean);

  // Vérifier si l'étudiant a déjà une inscription validée
  const hasValidatedInscription = inscriptions.some(i => 
    i.statut === 'VALIDEE' || i.statut === 'active'
  );

  const handleInscrire = async (groupe: Groupe) => {
    if (!etudiantId) {
      toast.error('Erreur: Vous devez être connecté');
      return;
    }
    
    setInscribing(groupe.id);
    try {
      await InscriptionService.inscrire(etudiantId, groupe.id);
      
      // Recharger les inscriptions de l'étudiant
      const response = await InscriptionService.getByEtudiant(etudiantId);
      setInscriptions(response.data || []);
      
      toast.success(`Demande d'inscription au groupe ${groupe.nom} envoyée`);
    } catch (error: any) {
      console.error('Erreur inscription:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setInscribing(null);
    }
  };

  const getInscriptionForGroupe = (groupeId: number) => {
    return inscriptions.find(i => i.groupe?.id === groupeId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Groupes disponibles</CardTitle>
        <CardDescription>Inscrivez-vous aux groupes de formation disponibles</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Groupe</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Cours associés</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupes.map((groupe) => {
                    const session = groupe.sessionPedagogique;
                    const coursAssocies = (groupeCoursMap[groupe.id] || [])
                      .map(gc => gc.cours?.titre)
                      .filter(Boolean);
                    const isInscrit = groupesInscritsIds.includes(groupe.id);
                    const inscription = getInscriptionForGroupe(groupe.id);
                    
                    return (
                      <TableRow key={groupe.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            {groupe.nom}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {session ? `${session.annee} - ${session.semestre}` : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {coursAssocies.length > 0 ? (
                              coursAssocies.slice(0, 3).map((titre, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {titre}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm">Aucun cours</span>
                            )}
                            {coursAssocies.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{coursAssocies.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {inscription && (
                            <Badge 
                              variant={
                                inscription.statut === 'VALIDEE' || inscription.statut === 'active' 
                                  ? 'default' 
                                  : inscription.statut === 'EN_ATTENTE' 
                                    ? 'secondary' 
                                    : 'destructive'
                              }
                            >
                              {inscription.statut === 'VALIDEE' || inscription.statut === 'active' 
                                ? 'Validée' 
                                : inscription.statut === 'EN_ATTENTE' 
                                  ? 'En attente' 
                                  : 'Refusée'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isInscrit ? (
                            <Badge variant="outline" className="gap-1">
                              <Check className="w-3 h-3" />
                              Inscrit
                            </Badge>
                          ) : hasValidatedInscription ? (
                            <Badge variant="secondary" className="text-xs">
                              Déjà inscrit à un groupe
                            </Badge>
                          ) : (
                            <Button 
                              size="sm" 
                              onClick={() => handleInscrire(groupe)}
                              disabled={inscribing === groupe.id}
                            >
                              {inscribing === groupe.id ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <Plus className="w-4 h-4 mr-1" />
                              )}
                              S'inscrire
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {groupes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun groupe disponible</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
