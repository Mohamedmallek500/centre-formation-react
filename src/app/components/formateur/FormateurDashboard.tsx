import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useApp } from '../../context/AppContext';
import { BookOpen, Users, BarChart3, Calendar, Loader2 } from 'lucide-react';
import { MesCours } from './MesCours';
import { GestionNotes } from './GestionNotes';
import { MonPlanning } from './MonPlanning';
import { Cours, Seance } from '../../types';
import FormateurService from '../Services/formateur-services';
import SeanceService from '../Services/seance-services';

export function FormateurDashboard() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('cours');
  const [cours, setCours] = useState<Cours[]>([]);
  const [seances, setSeances] = useState<Seance[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = state.currentUser;
  const formateurId = currentUser?.id;

  useEffect(() => {
    if (formateurId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [formateurId]);

  const loadData = async () => {
    if (!formateurId) return;
    
    setLoading(true);
    try {
      // Charger les cours du formateur
      const coursRes = await FormateurService.getCoursByFormateur(formateurId);
      setCours(coursRes.data || []);
      
      // Charger les séances du formateur
      const seancesRes = await SeanceService.getByFormateur(formateurId);
      setSeances(seancesRes.data || []);
    } catch (error) {
      console.error('Erreur chargement données formateur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Compter les séances à venir
  const seancesAVenir = seances.filter(s => new Date(s.heureDebut) >= new Date()).length;

  const stats = [
    { 
      label: 'Mes cours', 
      value: cours.length, 
      icon: BookOpen, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Séances à venir', 
      value: seancesAVenir, 
      icon: Calendar, 
      color: 'bg-purple-500' 
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Espace Formateur</h2>
        <p className="text-gray-500 mt-1">
          {currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'Gérez vos cours et vos étudiants'}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="text-3xl font-bold">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cours">
            <BookOpen className="w-4 h-4 mr-2" />
            Mes cours
          </TabsTrigger>
          <TabsTrigger value="notes">
            <BarChart3 className="w-4 h-4 mr-2" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="planning">
            <Calendar className="w-4 h-4 mr-2" />
            Mon planning
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cours">
          <MesCours />
        </TabsContent>

        <TabsContent value="notes">
          <GestionNotes />
        </TabsContent>

        <TabsContent value="planning">
          <MonPlanning />
        </TabsContent>
      </Tabs>
    </div>
  );
}
