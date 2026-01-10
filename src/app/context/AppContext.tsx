import { createContext, useContext, useState, ReactNode } from "react";
import { Utilisateur } from "../types";

// =====================
// Types du contexte
// =====================

interface AppState {
  currentUser: Utilisateur | null;
}

interface AppContextType {
  state: AppState;
  login: (user: Utilisateur) => void;
  logout: () => void;
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
    currentUser: null
  });

  const login = (user: Utilisateur) => {
    setState({
      ...state,
      currentUser: user
    });
  };

  const logout = () => {
    setState({
      ...state,
      currentUser: null
    });
  };

  return (
    <AppContext.Provider value={{ state, login, logout }}>
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
