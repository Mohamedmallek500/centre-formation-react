import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useApp } from '../../context/AppContext';
import { Calendar, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Seance } from '../../types';
import SeanceService from '../Services/seance-services';

export function MonPlanning() {
  const { state } = useApp();
  const [seances, setSeances] = useState<Seance[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const formateurId = state.currentUser?.id;

  useEffect(() => {
    if (formateurId) {
      loadSeances();
    } else {
      setLoading(false);
    }
  }, [formateurId]);

  const loadSeances = async () => {
    if (!formateurId) return;
    
    setLoading(true);
    try {
      const res = await SeanceService.getByFormateur(formateurId);
      setSeances(res.data || []);
    } catch (error) {
      console.error('Erreur chargement séances:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation semaine
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToToday = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  };

  // Générer les jours de la semaine
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(currentWeekStart);
    day.setDate(currentWeekStart.getDate() + i);
    return day;
  });

  // Heures de la journée (7h à 20h)
  const hours = Array.from({ length: 14 }, (_, i) => i + 7);

  // Filtrer les séances de la semaine
  const getSeancesForDay = (day: Date) => {
    return seances.filter(seance => {
      const seanceDate = new Date(seance.heureDebut);
      return seanceDate.toDateString() === day.toDateString();
    });
  };

  // Calculer la position et hauteur d'une séance
  const getSeanceStyle = (seance: Seance) => {
    const start = new Date(seance.heureDebut);
    const end = new Date(seance.heureFin);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const top = ((startHour - 7) / 14) * 100;
    const height = ((endHour - startHour) / 14) * 100;
    return { top: `${top}%`, height: `${height}%` };
  };

  // Couleurs par type de séance
  const getSeanceColor = (type: string) => {
    switch (type) {
      case 'CM': return 'bg-blue-100 border-blue-400 text-blue-800';
      case 'TD': return 'bg-green-100 border-green-400 text-green-800';
      case 'TP': return 'bg-purple-100 border-purple-400 text-purple-800';
      default: return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Mon planning
            </CardTitle>
            <CardDescription>Mes séances de cours planifiées</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Aujourd'hui
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="text-center mt-2">
          <span className="font-semibold">
            {currentWeekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            {' - '}
            {weekDays[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {seances.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune séance planifiée</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            {/* En-tête des jours */}
            <div className="grid grid-cols-8 border-b bg-gray-50">
              <div className="p-2 text-center text-sm font-medium border-r">Heure</div>
              {weekDays.map((day, index) => {
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <div 
                    key={index} 
                    className={`p-2 text-center border-r last:border-r-0 ${isToday ? 'bg-primary/10' : ''}`}
                  >
                    <div className="text-sm font-medium">
                      {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg ${isToday ? 'font-bold text-primary' : ''}`}>
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grille horaire */}
            <div className="grid grid-cols-8" style={{ minHeight: '600px' }}>
              {/* Colonne des heures */}
              <div className="border-r">
                {hours.map(hour => (
                  <div 
                    key={hour} 
                    className="h-[42.86px] border-b text-xs text-gray-500 text-right pr-2 pt-1"
                  >
                    {hour}:00
                  </div>
                ))}
              </div>

              {/* Colonnes des jours */}
              {weekDays.map((day, dayIndex) => {
                const daySeances = getSeancesForDay(day);
                const isToday = day.toDateString() === new Date().toDateString();
                
                return (
                  <div 
                    key={dayIndex} 
                    className={`border-r last:border-r-0 relative ${isToday ? 'bg-primary/5' : ''}`}
                  >
                    {/* Lignes horizontales */}
                    {hours.map(hour => (
                      <div key={hour} className="h-[42.86px] border-b" />
                    ))}
                    
                    {/* Séances */}
                    {daySeances.map(seance => {
                      const style = getSeanceStyle(seance);
                      const colorClass = getSeanceColor(seance.typeSeance);
                      
                      return (
                        <div
                          key={seance.id}
                          className={`absolute left-1 right-1 ${colorClass} border-l-4 rounded p-1 overflow-hidden cursor-pointer hover:shadow-md transition-shadow`}
                          style={style}
                          title={`${seance.cours?.titre || 'Cours'} - ${seance.groupe?.nom || 'Groupe'}`}
                        >
                          <div className="text-xs font-semibold truncate">
                            {seance.cours?.titre || seance.cours?.code || 'Cours'}
                          </div>
                          <div className="text-xs truncate">
                            {formatTime(seance.heureDebut)} - {formatTime(seance.heureFin)}
                          </div>
                          <div className="text-xs truncate">
                            {seance.salle}
                          </div>
                          <div className="text-xs truncate">
                            {seance.groupe?.nom || 'Groupe'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Légende */}
        <div className="flex gap-4 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border-l-4 border-blue-400 rounded" />
            <span className="text-sm">CM</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-l-4 border-green-400 rounded" />
            <span className="text-sm">TD</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-100 border-l-4 border-purple-400 rounded" />
            <span className="text-sm">TP</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
