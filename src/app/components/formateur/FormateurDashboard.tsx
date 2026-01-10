import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useApp } from '../../context/AppContext';
import { BookOpen, Users, BarChart3, Calendar } from 'lucide-react';
import { MesCours } from './MesCours';
import { GestionNotes } from './GestionNotes';
import { MonPlanning } from './MonPlanning';

export function FormateurDashboard() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('cours');
  
  const formateurId = state.currentUser?.id || '';
  const mesCours = state.cours.filter(c => c.formateurId === formateurId);
  const mesEtudiants = new Set(mesCours.flatMap(c => c.etudiants));
  const mesSeances = state.seances.filter(s => 
    mesCours.some(c => c.code === s.coursCode)
  );

  const stats = [
    { 
      label: 'Mes cours', 
      value: mesCours.length, 
      icon: BookOpen, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Étudiants', 
      value: mesEtudiants.size, 
      icon: Users, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Séances à venir', 
      value: mesSeances.filter(s => new Date(s.date) >= new Date()).length, 
      icon: Calendar, 
      color: 'bg-purple-500' 
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Espace Formateur</h2>
        <p className="text-gray-500 mt-1">Gérez vos cours et vos étudiants</p>
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
