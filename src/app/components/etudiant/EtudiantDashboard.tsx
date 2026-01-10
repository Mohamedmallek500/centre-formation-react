import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useApp } from '../../context/AppContext';
import { BookOpen, BarChart3, Calendar, Award } from 'lucide-react';
import { MesCours as EtudiantMesCours } from './MesCours';
import { MesNotes } from './MesNotes';
import { MonEmploiDuTemps } from './MonEmploiDuTemps';
import { CoursDisponibles } from './CoursDisponibles';

export function EtudiantDashboard() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('cours');
  
  // Trouver l'étudiant correspondant à l'utilisateur connecté
  const etudiant = state.etudiants.find(e => e.email === state.currentUser?.email);
  const matricule = etudiant?.matricule || '';
  
  const mesInscriptions = state.inscriptions.filter(i => 
    i.etudiantMatricule === matricule && i.statut === 'active'
  );
  const mesNotes = state.notes.filter(n => n.etudiantMatricule === matricule);
  const moyenne = mesNotes.length > 0
    ? mesNotes.reduce((acc, n) => acc + n.valeur, 0) / mesNotes.length
    : 0;

  const stats = [
    { 
      label: 'Cours inscrits', 
      value: mesInscriptions.length, 
      icon: BookOpen, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Notes obtenues', 
      value: mesNotes.length, 
      icon: Award, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Moyenne générale', 
      value: moyenne > 0 ? moyenne.toFixed(2) : '-', 
      icon: BarChart3, 
      color: moyenne >= 10 ? 'bg-green-500' : 'bg-red-500' 
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Espace Étudiant</h2>
        <p className="text-gray-500 mt-1">
          {etudiant ? `${etudiant.prenom} ${etudiant.nom} - ${etudiant.matricule}` : 'Bienvenue'}
        </p>
      </div>

      {/* Statistics */}
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
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
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
          <TabsTrigger value="disponibles">
            <Award className="w-4 h-4 mr-2" />
            Inscription
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cours">
          <EtudiantMesCours />
        </TabsContent>

        <TabsContent value="notes">
          <MesNotes />
        </TabsContent>

        <TabsContent value="planning">
          <MonEmploiDuTemps />
        </TabsContent>

        <TabsContent value="disponibles">
          <CoursDisponibles />
        </TabsContent>
      </Tabs>
    </div>
  );
}
