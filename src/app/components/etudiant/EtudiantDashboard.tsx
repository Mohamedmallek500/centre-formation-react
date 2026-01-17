import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useApp } from '../../context/AppContext';
import { BookOpen, BarChart3, Calendar, Award, Loader2 } from 'lucide-react';
import { MesCours as EtudiantMesCours } from './MesCours';
import { MesNotes } from './MesNotes';
import { MonEmploiDuTemps } from './MonEmploiDuTemps';
import { CoursDisponibles } from './CoursDisponibles';
import { Inscription, Note } from '../../types';
import InscriptionService from '../Services/inscription-services';
import NoteService from '../Services/note-services';

export function EtudiantDashboard() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('disponibles'); // Par défaut sur inscription
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // L'utilisateur connecté est l'étudiant
  const currentUser = state.currentUser;
  const etudiantId = currentUser?.id;

  // Vérifier si l'étudiant a une inscription validée
  const hasValidatedInscription = inscriptions.some(i => 
    i.statut === 'VALIDEE' || i.statut === 'active'
  );

  useEffect(() => {
    if (etudiantId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [etudiantId]);

  // Mettre à jour l'onglet actif quand le statut d'inscription change
  useEffect(() => {
    if (!loading) {
      if (hasValidatedInscription && activeTab === 'disponibles') {
        setActiveTab('cours');
      } else if (!hasValidatedInscription) {
        setActiveTab('disponibles');
      }
    }
  }, [hasValidatedInscription, loading]);

  const loadData = async () => {
    if (!etudiantId) return;
    
    setLoading(true);
    try {
      const [inscRes, notesRes] = await Promise.all([
        InscriptionService.getByEtudiant(etudiantId),
        NoteService.getByEtudiant(etudiantId)
      ]);
      
      setInscriptions(inscRes.data || []);
      setNotes(notesRes.data || []);
    } catch (error) {
      console.error('Erreur chargement données étudiant:', error);
    } finally {
      setLoading(false);
    }
  };

  const mesInscriptionsValidees = inscriptions.filter(i => 
    i.statut === 'VALIDEE' || i.statut === 'active'
  );

  const moyenne = notes.length > 0
    ? notes.reduce((acc, n) => acc + n.valeur, 0) / notes.length
    : 0;

  // Noms des groupes inscrits
  const groupesInscritsNoms = mesInscriptionsValidees
    .map(i => i.groupe?.nom)
    .filter(Boolean)
    .join(', ') || '-';

  const stats = hasValidatedInscription ? [
    { 
      label: 'Groupes inscrits', 
      value: mesInscriptionsValidees.length,
      subValue: groupesInscritsNoms,
      icon: BookOpen, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Notes obtenues', 
      value: notes.length, 
      icon: Award, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Moyenne générale', 
      value: moyenne > 0 ? moyenne.toFixed(2) : '-', 
      icon: BarChart3, 
      color: moyenne >= 10 ? 'bg-green-500' : 'bg-red-500' 
    }
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Espace Étudiant</h2>
        <p className="text-gray-500 mt-1">
          {currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'Bienvenue'}
        </p>
      </div>

      {/* Statistics - uniquement si inscrit */}
      {hasValidatedInscription ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.label}
                </CardTitle>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                {stat.subValue ? (
                  // Affichage spécial pour Groupes inscrits (nom en gras, sans valeur numérique)
                  <div className="text-xl font-bold truncate" title={stat.subValue}>
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stat.subValue}
                  </div>
              ) : (
                <div className="text-3xl font-bold">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stat.value}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      ) : !loading && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-amber-500" />
              <div>
                <p className="font-medium text-amber-800">Vous n'êtes pas encore inscrit à un groupe</p>
                <p className="text-sm text-amber-600">Veuillez vous inscrire à un groupe pour accéder à vos cours, notes et emploi du temps.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full ${hasValidatedInscription ? 'grid-cols-4' : 'grid-cols-1'}`}>
          {hasValidatedInscription && (
            <>
              <TabsTrigger value="cours">
                <BookOpen className="w-4 h-4 mr-2" />
                Mes cours
              </TabsTrigger>
              <TabsTrigger value="notes">
                <BarChart3 className="w-4 h-4 mr-2" />
                Mes notes
              </TabsTrigger>
              <TabsTrigger value="planning">
                <Calendar className="w-4 h-4 mr-2" />
                Emploi du temps
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="disponibles">
            <Award className="w-4 h-4 mr-2" />
            Inscription
          </TabsTrigger>
        </TabsList>

        {hasValidatedInscription && (
          <>
            <TabsContent value="cours">
              <EtudiantMesCours />
            </TabsContent>

            <TabsContent value="notes">
              <MesNotes />
            </TabsContent>

            <TabsContent value="planning">
              <MonEmploiDuTemps />
            </TabsContent>
          </>
        )}

        <TabsContent value="disponibles">
          <CoursDisponibles />
        </TabsContent>
      </Tabs>
    </div>
  );
}
