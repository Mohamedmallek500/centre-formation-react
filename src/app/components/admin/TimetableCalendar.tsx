import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Seance, Cours, Formateur } from '../../types';

interface TimetableCalendarProps {
    seances: Seance[];
    cours: Cours[];
    formateurs: Formateur[];
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8h to 18h

export function TimetableCalendar({ seances, cours, formateurs }: TimetableCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Calculate start of current week (Monday)
    const weekStart = useMemo(() => {
        const d = new Date(currentDate);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }, [currentDate]);

    // Calculate end of week (Saturday)
    const weekEnd = useMemo(() => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + 5);
        d.setHours(23, 59, 59, 999);
        return d;
    }, [weekStart]);

    // Filter seances for this week
    const weekSeances = useMemo(() => {
        return seances.filter(s => {
            const d = new Date(s.heureDebut);
            return d >= weekStart && d <= weekEnd;
        });
    }, [seances, weekStart, weekEnd]);

    const nextWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 7);
        setCurrentDate(d);
    };

    const prevWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 7);
        setCurrentDate(d);
    };

    const getDaySeances = (dayIndex: number) => {
        // 0 = Monday, 1 = Tuesday ... (in our DAYS array)
        // Date.getDay(): 0=Sun, 1=Mon...
        // We want to match: weekStart + dayIndex
        const targetDate = new Date(weekStart);
        targetDate.setDate(targetDate.getDate() + dayIndex);

        return weekSeances.filter(s => {
            const d = new Date(s.heureDebut);
            return d.getDate() === targetDate.getDate() &&
                d.getMonth() === targetDate.getMonth() &&
                d.getFullYear() === targetDate.getFullYear();
        });
    };

    const getPositionStyle = (seance: Seance) => {
        const start = new Date(seance.heureDebut);
        const end = new Date(seance.heureFin);

        // Start hour relative to 8am
        const startHour = start.getHours() + start.getMinutes() / 60;
        const endHour = end.getHours() + end.getMinutes() / 60;

        const top = ((startHour - 8) * 60) + 'px'; // 60px per hour
        const height = ((endHour - startHour) * 60) + 'px';

        return { top, height };
    };

    return (
        <div className="flex flex-col space-y-4">
            {/* Header controls */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold text-lg capitalize">
                        {weekStart.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-gray-400 text-sm">
                        (Semaine du {weekStart.toLocaleDateString('fr-FR', { day: 'numeric' })} au {weekEnd.toLocaleDateString('fr-FR', { day: 'numeric' })})
                    </span>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={prevWeek}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                        Aujourd'hui
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextWeek}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden flex">
                {/* Time Column */}
                <div className="w-16 flex-shrink-0 border-r bg-gray-50">
                    <div className="h-12 border-b"></div> {/* Header spacer */}
                    {HOURS.map(h => (
                        <div key={h} className="h-[60px] border-b text-xs text-gray-400 flex items-start justify-center pt-1">
                            {h}:00
                        </div>
                    ))}
                </div>

                {/* Days Columns */}
                <div className="flex-1 grid grid-cols-6 divide-x">
                    {DAYS.map((day, dayIndex) => (
                        <div key={day} className="relative min-w-[120px]">
                            {/* Header */}
                            <div className="h-12 border-b bg-gray-50 flex items-center justify-center font-medium text-sm">
                                {day} <span className="ml-1 text-gray-400 font-normal">
                                    {new Date(weekStart.getTime() + dayIndex * 86400000).getDate()}
                                </span>
                            </div>

                            {/* Content Container (11 hours * 60px = 660px) */}
                            <div className="relative h-[660px]">
                                {/* Grid lines */}
                                {HOURS.map(h => (
                                    <div key={h} className="h-[60px] border-b border-gray-100 box-border w-full absolute top-[${(h-8)*60}px]" style={{ top: (h - 8) * 60 }}></div>
                                ))}

                                {/* Events */}
                                {getDaySeances(dayIndex).map(seance => {
                                    const style = getPositionStyle(seance);
                                    // Resolve relations
                                    // Make sure we check string/number compatibility for IDs
                                    const seanceCours = seance.cours || cours.find(c => c.id.toString() === seance.coursCode?.toString());
                                    const coursTitre = seanceCours?.titre || `Cours #${seance.coursCode || '?'}`;

                                    // Resolve Formateur
                                    let formateurNom = "";
                                    if (seanceCours) {
                                        if (seanceCours.formateur) {
                                            formateurNom = `${seanceCours.formateur.nom} ${seanceCours.formateur.prenom}`;
                                        } else if (seanceCours.formateurId) {
                                            const fmt = formateurs.find(f => f.id.toString() === seanceCours.formateurId?.toString());
                                            if (fmt) formateurNom = `${fmt.nom} ${fmt.prenom}`;
                                        }
                                    }

                                    return (
                                        <div
                                            key={seance.id}
                                            className={`absolute inset-x-1 rounded p-2 text-xs border overflow-hidden transition-all hover:z-10 hover:shadow-md cursor-pointer
                                        ${seance.typeSeance === 'CM' ? 'bg-blue-100 border-blue-200 text-blue-800' :
                                                    seance.typeSeance === 'TD' ? 'bg-green-100 border-green-200 text-green-800' :
                                                        'bg-orange-100 border-orange-200 text-orange-800'}`}
                                            style={style}
                                            title={`${coursTitre} - ${seance.typeSeance}\n${formateurNom}\n${seance.salle}\n${seance.heureDebut} - ${seance.heureFin}`}
                                        >
                                            <div className="font-bold truncate">{coursTitre}</div>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="font-semibold opacity-75">{seance.typeSeance}</span>
                                                <span className="truncate max-w-[50%]">{seance.salle}</span>
                                            </div>
                                            {formateurNom && (
                                                <div className="text-[10px] font-medium mt-1 truncate">
                                                    {formateurNom}
                                                </div>
                                            )}
                                            <div className="text-[10px] opacity-75 mt-0.5">
                                                {new Date(seance.heureDebut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                -
                                                {new Date(seance.heureFin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
