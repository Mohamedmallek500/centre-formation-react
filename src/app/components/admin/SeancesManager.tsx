import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useApp } from '../../context/AppContext';
import { Seance, TypeSeance } from '../../types';
import { Plus, Trash2, Calendar, Clock, School, Users, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import SeanceService from '../Services/seance-services';
import GroupeService from '../Services/groupe-services';
import FormateurService from '../Services/formateur-services';
import CoursService from '../Services/cours-services';
import { TimetableCalendar } from './TimetableCalendar';

export function SeancesManager() {
    const { state, setSeances, setGroupes, setFormateurs, setCours } = useApp();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('liste');

    // Timetable view states
    const [selectedGroupeId, setSelectedGroupeId] = useState<string>('');
    const [selectedFormateurId, setSelectedFormateurId] = useState<string>('');
    const [filteredSeances, setFilteredSeances] = useState<Seance[]>([]);

    // Form states
    const [formData, setFormData] = useState({
        groupeId: '',
        coursId: '',
        heureDebut: '',
        heureFin: '',
        salle: '',
        typeSeance: 'CM' as TypeSeance,
        date: '' // Helper for UI, combined with time for API
    });

    // Fetch all initial data on mount
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Parallel fetching for performance
                const [seancesRes, groupesRes, formateursRes, coursRes] = await Promise.all([
                    SeanceService.getAll(),
                    GroupeService.getAll(),
                    FormateurService.getAll(),
                    CoursService.getAll()
                ]);

                setSeances(seancesRes.data);
                setGroupes(groupesRes.data);
                setFormateurs(formateursRes.data);
                setCours(coursRes.data);

                // Initialize filtered seances with all seances
                setFilteredSeances(seancesRes.data);

            } catch (error) {
                console.error("Error fetching initial data:", error);
                toast.error("Erreur lors du chargement des données");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []); // ⚡ Fixed: Empty dependency array to run only once on mount

    // Fetch seances based on active tab and selection
    useEffect(() => {
        if (activeTab === 'liste') {
            // already in state.seances from fetchAllSeances ideally, or locally
            setFilteredSeances(state.seances);
        } else if (activeTab === 'groupe' && selectedGroupeId) {
            fetchSeancesByGroupe(selectedGroupeId);
        } else if (activeTab === 'formateur' && selectedFormateurId) {
            fetchSeancesByFormateur(selectedFormateurId);
        }
    }, [activeTab, selectedGroupeId, selectedFormateurId, state.seances]);

    // Helper to refresh just seances (after add/delete)
    const fetchAllSeances = async () => {
        try {
            // setLoading(true); // Optional: avoid full spinner for simple refresh
            const response = await SeanceService.getAll();
            setSeances(response.data);
            // Also update filtered if we are in list view
            if (activeTab === 'liste') {
                setFilteredSeances(response.data);
            }
        } catch (error) {
            console.error("Error fetching seances:", error);
        }
    };

    const fetchSeancesByGroupe = async (groupeId: string) => {
        try {
            setLoading(true);
            const response = await SeanceService.getByGroupe(groupeId);
            setFilteredSeances(response.data);
        } catch (error) {
            console.error("Error fetching groupe seances:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSeancesByFormateur = async (formateurId: string) => {
        try {
            setLoading(true);
            const response = await SeanceService.getByFormateur(formateurId);
            setFilteredSeances(response.data);
        } catch (error) {
            console.error("Error fetching formateur seances:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Combine date and time
        // API expects full LocalDateTime string? 
        // Usually standard datetime-local input returns "YYYY-MM-DDTHH:MM" properties
        // SeanceService.create takes args separately.
        // Let's assume the service handles sending them as is or we format them.
        // Looking at seance-services.js: create: (groupeId, coursId, heureDebut, heureFin, salle, typeSeance)
        // Looking at Types: heureDebut: string (LocalDateTime -> string)

        // We will construct the ISO strings
        const startDateTime = `${formData.date}T${formData.heureDebut}:00`;
        const endDateTime = `${formData.date}T${formData.heureFin}:00`;

        try {
            await SeanceService.create(
                formData.groupeId,
                formData.coursId,
                startDateTime,
                endDateTime,
                formData.salle,
                formData.typeSeance
            );

            toast.success('Séance ajoutée avec succès');
            fetchAllSeances(); // Refresh list
            resetForm();
        } catch (err) {
            console.error("Error creating seance", err);
            toast.error("Erreur lors de la création de la séance");
        }
    };

    const handleDelete = async (id: string | number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) {
            try {
                await SeanceService.delete(id);
                toast.success('Séance supprimée');
                // Remove locally or refresh
                const updated = state.seances.filter(s => s.id !== id);
                setSeances(updated);
                // Also update filtered
                setFilteredSeances(filteredSeances.filter(s => s.id !== id));
            } catch (err) {
                console.error("Error deleting seance", err);
                toast.error("Erreur lors de la suppression");
            }
        }
    };

    const resetForm = () => {
        setFormData({
            groupeId: '',
            coursId: '',
            heureDebut: '',
            heureFin: '',
            salle: '',
            typeSeance: 'CM',
            date: ''
        });
        setIsDialogOpen(false);
    };

    // Helper to format date display
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleString('fr-FR', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Gestion des Séances</CardTitle>
                        <CardDescription>Planification des cours (CM, TD, TP)</CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                                <Plus className="w-4 h-4 mr-2" />
                                Nouvelle Séance
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Ajouter une séance</DialogTitle>
                                <DialogDescription>Programmer une nouvelle séance de cours.</DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Groupe</Label>
                                        <Select onValueChange={(v) => setFormData({ ...formData, groupeId: v })} value={formData.groupeId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un groupe" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {state.groupes.map(g => (
                                                    <SelectItem key={g.id} value={g.id.toString()}>{g.nom}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Cours</Label>
                                        <Select onValueChange={(v) => setFormData({ ...formData, coursId: v })} value={formData.coursId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un cours" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {state.cours.map(c => (
                                                    <SelectItem key={c.id} value={c.id.toString()}>{c.titre}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Heure Début</Label>
                                        <Input type="time" value={formData.heureDebut} onChange={(e) => setFormData({ ...formData, heureDebut: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Heure Fin</Label>
                                        <Input type="time" value={formData.heureFin} onChange={(e) => setFormData({ ...formData, heureFin: e.target.value })} required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Salle</Label>
                                        <Input placeholder="Ex: Salle 101, Amphi A..." value={formData.salle} onChange={(e) => setFormData({ ...formData, salle: e.target.value })} required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select onValueChange={(v: TypeSeance) => setFormData({ ...formData, typeSeance: v })} value={formData.typeSeance}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CM">Cours Magistral (CM)</SelectItem>
                                                <SelectItem value="TD">Travaux Dirigés (TD)</SelectItem>
                                                <SelectItem value="TP">Travaux Pratiques (TP)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 pt-4">
                                    <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button>
                                    <Button type="submit">Enregistrer</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>

            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="liste">Toutes les séances</TabsTrigger>
                        <TabsTrigger value="groupe">Emploi du temps Groupe</TabsTrigger>
                        <TabsTrigger value="formateur">Emploi du temps Formateur</TabsTrigger>
                    </TabsList>

                    {/* FILTERS FOR VIEWS */}
                    {activeTab === 'groupe' && (
                        <div className="mb-4 flex items-center space-x-4">
                            <Label>Choisir un groupe :</Label>
                            <Select onValueChange={(v) => setSelectedGroupeId(v)} value={selectedGroupeId}>
                                <SelectTrigger className="w-[250px]">
                                    <SelectValue placeholder="Groupe..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {state.groupes.map(g => (
                                        <SelectItem key={g.id} value={g.id.toString()}>{g.nom}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {activeTab === 'formateur' && (
                        <div className="mb-4 flex items-center space-x-4">
                            <Label>Choisir un formateur :</Label>
                            <Select onValueChange={(v) => setSelectedFormateurId(v)} value={selectedFormateurId}>
                                <SelectTrigger className="w-[250px]">
                                    <SelectValue placeholder="Formateur..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {state.formateurs.map(f => (
                                        <SelectItem key={f.id} value={f.id.toString()}>{f.nom} {f.prenom}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* CONTENT AREA */}
                    <div className="rounded-md border overflow-x-auto">
                        {activeTab === 'liste' ? (
                            /* LIST VIEW - TABLE */
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Date & Heure</TableHead>
                                        <TableHead>Matière</TableHead>
                                        <TableHead>Formateur</TableHead>
                                        <TableHead>Groupe</TableHead>
                                        <TableHead>Salle</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">Chargement...</TableCell>
                                        </TableRow>
                                    ) : filteredSeances.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">Aucune séance trouvée</TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredSeances.map((seance) => {
                                            // Resolve relations
                                            // Ensure consistent string comparison for IDs
                                            const cours = seance.cours || state.cours.find(c => c.id.toString() === seance.coursCode?.toString());
                                            const coursTitre = cours?.titre || `Cours #${seance.coursCode || '?'}`;

                                            // Resolve Formateur
                                            let formateurNom = "-";
                                            if (cours) {
                                                if (cours.formateur) {
                                                    formateurNom = `${cours.formateur.nom} ${cours.formateur.prenom}`;
                                                } else if (cours.formateurId) {
                                                    const fmt = state.formateurs.find(f => f.id.toString() === cours.formateurId?.toString());
                                                    if (fmt) formateurNom = `${fmt.nom} ${fmt.prenom}`;
                                                }
                                            }

                                            const groupeNom = seance.groupe?.nom || `Groupe #${seance.groupeId || '?'}`;

                                            return (
                                                <TableRow key={seance.id}>
                                                    <TableCell>
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold
                                            ${seance.typeSeance === 'CM' ? 'bg-blue-100 text-blue-700' :
                                                                seance.typeSeance === 'TD' ? 'bg-green-100 text-green-700' :
                                                                    'bg-orange-100 text-orange-700'}`}>
                                                            {seance.typeSeance}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">
                                                                {new Date(seance.heureDebut).toLocaleDateString('fr-FR')}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {new Date(seance.heureDebut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                                {new Date(seance.heureFin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{coursTitre}</TableCell>
                                                    <TableCell>{formateurNom}</TableCell>
                                                    <TableCell>{groupeNom}</TableCell>
                                                    <TableCell>{seance.salle}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(seance.id)}>
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        ) : (
                            /* CALENDAR VIEW */
                            <div className="p-4">
                                {(activeTab === 'groupe' && !selectedGroupeId) || (activeTab === 'formateur' && !selectedFormateurId) ? (
                                    <div className="text-center py-10 text-gray-500">
                                        Veuillez sélectionner un {activeTab === 'groupe' ? 'groupe' : 'formateur'} pour voir l'emploi du temps
                                    </div>
                                ) : (
                                    <TimetableCalendar
                                        seances={filteredSeances}
                                        cours={state.cours}
                                        formateurs={state.formateurs}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    );
}
