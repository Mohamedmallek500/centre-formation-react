import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users, BookOpen, GraduationCap, Calendar, BarChart3, Award, UsersRound, Loader2 } from 'lucide-react';
import { EtudiantsManager } from './EtudiantsManager';
import { FormateursManager } from './FormateursManager';
import { CoursManager } from './CoursManager';
import { InscriptionsManager } from './InscriptionsManager';
import { NotesManager } from './NotesManager';
import { SessionsManager } from './SessionsManager';
import { SeancesManager } from './SeancesManager';
import { GroupesManager } from './GroupesManager';
import DashboardService from '../Services/dashboard-services';

// Types pour les données du dashboard
interface DashboardStats {
  totalEtudiants: number;
  totalFormateurs: number;
  totalGroupes: number;
  activeInscriptions: number;
}

interface RecentInscription {
  id: number;
  etudiantNom: string;
  etudiantPrenom: string;
  groupeTitre: string;
  dateInscription: string;
}

interface SpecialiteStat {
  specialiteNom: string;
  count: number;
  percentage: number;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalEtudiants: 0,
    totalFormateurs: 0,
    totalGroupes: 0,
    activeInscriptions: 0
  });
  const [recentInscriptions, setRecentInscriptions] = useState<RecentInscription[]>([]);
  const [specialiteStats, setSpecialiteStats] = useState<SpecialiteStat[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await DashboardService.getAllDashboardData();
      setDashboardStats(data.stats);
      setRecentInscriptions(data.recentInscriptions || []);
      setSpecialiteStats(data.specialiteStats || []);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Étudiants',
      value: dashboardStats.totalEtudiants,
      icon: GraduationCap,
      color: 'bg-blue-500'
    },
    {
      label: 'Formateurs',
      value: dashboardStats.totalFormateurs,
      icon: Users,
      color: 'bg-green-500'
    },
    {
      label: 'Groupes',
      value: dashboardStats.totalGroupes,
      icon: UsersRound,
      color: 'bg-purple-500'
    },
    {
      label: 'Inscriptions actives',
      value: dashboardStats.activeInscriptions,
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
                  <div className="text-3xl font-bold">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stat.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dernières inscriptions</CardTitle>
                <CardDescription>Les inscriptions les plus récentes</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : recentInscriptions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucune inscription récente
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentInscriptions.map(inscription => (
                      <div key={inscription.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{inscription.etudiantPrenom} {inscription.etudiantNom}</p>
                          <p className="text-sm text-gray-500">{inscription.groupeTitre}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(inscription.dateInscription).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition des spécialités</CardTitle>
                <CardDescription>Nombre d'étudiants par spécialité</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : specialiteStats.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucune donnée de spécialité
                  </div>
                ) : (
                  <div className="space-y-3">
                    {specialiteStats.map((spec, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{spec.specialiteNom}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600"
                              style={{ width: `${spec.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{spec.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
