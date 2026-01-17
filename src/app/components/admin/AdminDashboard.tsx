import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useApp } from '../../context/AppContext';
import { Users, BookOpen, GraduationCap, Calendar, BarChart3, Award, UsersRound, FolderTree } from 'lucide-react';
import { EtudiantsManager } from './EtudiantsManager';
import { FormateursManager } from './FormateursManager';
import { CoursManager } from './CoursManager';
import { InscriptionsManager } from './InscriptionsManager';
import { NotesManager } from './NotesManager';
import { SessionsManager } from './SessionsManager';
import { SeancesManager } from './SeancesManager';
import { GroupesManager } from './GroupesManager';
import { PlanningManager } from './PlanningManager';

export function AdminDashboard() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('overview');



  const stats = [
    {
      label: 'Étudiants',
      value: state.etudiants.length,
      icon: GraduationCap,
      color: 'bg-blue-500'
    },
    {
      label: 'Formateurs',
      value: state.formateurs.length,
      icon: Users,
      color: 'bg-green-500'
    },
    {
      label: 'Cours',
      value: state.cours.length,
      icon: BookOpen,
      color: 'bg-purple-500'
    },
    {
      label: 'Inscriptions',
      value: state.inscriptions.filter(i => i.statut === 'active').length,
      icon: Award,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Tableau de bord administrateur</h2>
        <p className="text-gray-500 mt-1">Gestion complète du centre de formation</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 gap-2">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <BarChart3 className="w-4 h-4 mr-1" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="etudiants" className="text-xs sm:text-sm">
            <GraduationCap className="w-4 h-4 mr-1" />
            Étudiants
          </TabsTrigger>
          <TabsTrigger value="formateurs" className="text-xs sm:text-sm">
            <Users className="w-4 h-4 mr-1" />
            Formateurs
          </TabsTrigger>
          <TabsTrigger value="cours" className="text-xs sm:text-sm">
            <BookOpen className="w-4 h-4 mr-1" />
            Cours
          </TabsTrigger>
          <TabsTrigger value="inscriptions" className="text-xs sm:text-sm">
            <Award className="w-4 h-4 mr-1" />
            Inscriptions
          </TabsTrigger>
          <TabsTrigger value="notes" className="text-xs sm:text-sm">
            <BarChart3 className="w-4 h-4 mr-1" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs sm:text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="seances" className="text-xs sm:text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            Séances
          </TabsTrigger>
          <TabsTrigger value="groupes" className="text-xs sm:text-sm">
            <UsersRound className="w-4 h-4 mr-1" />
            Groupes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dernières inscriptions</CardTitle>
                <CardDescription>Les 5 dernières inscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {state.inscriptions
                    .filter(i => i.statut === 'active')
                    .sort((a, b) => new Date(b.dateInscription).getTime() - new Date(a.dateInscription).getTime())
                    .slice(0, 5)
                    .map(inscription => {
                      const etudiant = state.etudiants.find(e => e.matricule === inscription.etudiantMatricule);
                      const cours = state.cours.find(c => c.code === inscription.coursCode);
                      return (
                        <div key={inscription.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{etudiant?.prenom} {etudiant?.nom}</p>
                            <p className="text-sm text-gray-500">{cours?.titre}</p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(inscription.dateInscription).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition des spécialités</CardTitle>
                <CardDescription>Nombre d'étudiants par spécialité</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {state.specialites.map(spec => {
                    const count = state.etudiants.filter(e => e.specialiteId === spec.id).length;
                    return (
                      <div key={spec.id} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{spec.nom}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600"
                              style={{ width: `${(count / state.etudiants.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Planning Overview */}
          <PlanningManager />
        </TabsContent>

        <TabsContent value="etudiants">
          <EtudiantsManager />
        </TabsContent>

        <TabsContent value="formateurs">
          <FormateursManager />
        </TabsContent>

        <TabsContent value="cours">
          <CoursManager />
        </TabsContent>

        <TabsContent value="inscriptions">
          <InscriptionsManager />
        </TabsContent>

        <TabsContent value="notes">
          <NotesManager />
        </TabsContent>

        <TabsContent value="sessions">
          <SessionsManager />
        </TabsContent>

        <TabsContent value="seances">
          <SeancesManager />
        </TabsContent>

        <TabsContent value="groupes">
          <GroupesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
