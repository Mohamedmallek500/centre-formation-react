import { createContext, useContext, useState, ReactNode } from "react";
import {
  Utilisateur,
  Etudiant,
  Formateur,
  Cours,
  Inscription,
  Note,
  Seance,
  SessionPedagogique,
  Groupe
} from "../types";

// =====================
// Types du contexte
// =====================

export interface Specialite {
  id: string;
  nom: string;
  code: string;
  description?: string;
}

interface AppState {
  currentUser: Utilisateur | null;
  etudiants: Etudiant[];
  formateurs: Formateur[];
  cours: Cours[];
  inscriptions: Inscription[];
  notes: Note[];
  seances: Seance[];
  sessions: SessionPedagogique[];
  specialites: Specialite[];
  groupes: Groupe[];
}

interface AppContextType {
  state: AppState;
  login: (user: Utilisateur) => void;
  logout: () => void;
  setEtudiants: (etudiants: Etudiant[]) => void;
  setFormateurs: (formateurs: Formateur[]) => void;
  setCours: (cours: Cours[]) => void;
  setInscriptions: (inscriptions: Inscription[]) => void;
  setNotes: (notes: Note[]) => void;
  setSeances: (seances: Seance[]) => void;
  setSessions: (sessions: SessionPedagogique[]) => void;
  setSpecialites: (specialites: Specialite[]) => void;
  setGroupes: (groupes: Groupe[]) => void;
}

// =====================
// Création du contexte
// =====================

const AppContext = createContext<AppContextType | undefined>(undefined);

// =====================
// Provider
// =====================

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    etudiants: [],
    formateurs: [],
    cours: [],
    inscriptions: [],
    notes: [],
    seances: [],
    sessions: [],
    specialites: [],
    groupes: []
  });

  const login = (user: Utilisateur) => {
    setState({
      ...state,
      currentUser: user
    });
  };

  const logout = () => {
    setState({
      currentUser: null,
      etudiants: [],
      formateurs: [],
      cours: [],
      inscriptions: [],
      notes: [],
      seances: [],
      sessions: [],
      specialites: [],
      groupes: []
    });
  };

  const setEtudiants = (etudiants: Etudiant[]) => {
    setState(prev => ({ ...prev, etudiants }));
  };

  const setFormateurs = (formateurs: Formateur[]) => {
    setState(prev => ({ ...prev, formateurs }));
  };

  const setCours = (cours: Cours[]) => {
    setState(prev => ({ ...prev, cours }));
  };

  const setInscriptions = (inscriptions: Inscription[]) => {
    setState(prev => ({ ...prev, inscriptions }));
  };

  const setNotes = (notes: Note[]) => {
    setState(prev => ({ ...prev, notes }));
  };

  const setSeances = (seances: Seance[]) => {
    setState(prev => ({ ...prev, seances }));
  };

  const setSessions = (sessions: SessionPedagogique[]) => {
    setState(prev => ({ ...prev, sessions }));
  };

  const setSpecialites = (specialites: Specialite[]) => {
    setState(prev => ({ ...prev, specialites }));
  };

  const setGroupes = (groupes: Groupe[]) => {
    setState(prev => ({ ...prev, groupes }));
  };

  return (
    <AppContext.Provider value={{
      state,
      login,
      logout,
      setEtudiants,
      setFormateurs,
      setCours,
      setInscriptions,
      setNotes,
      setSeances,
      setSessions,
      setSpecialites,
      setGroupes
    }}>
      {children}
    </AppContext.Provider>
  );
}

// =====================
// Hook personnalisé
// =====================

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
