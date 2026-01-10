// src/app/components/Layout.tsx
import { Outlet } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Button } from "./ui/button";
import { LogOut, GraduationCap } from "lucide-react";
import { Badge } from "./ui/badge";

export function Layout() {
  const { state, logout } = useApp();
  const user = state.currentUser;

  if (!user) return null;

  const role = user.roles?.[0];

  const getRoleBadgeVariant = () => {
    switch (role) {
      case "ADMIN":
        return "default";
      case "FORMATEUR":
        return "secondary";
      case "ETUDIANT":
        return "outline";
      default:
        return "default";
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case "ADMIN":
        return "Administrateur";
      case "FORMATEUR":
        return "Formateur";
      case "ETUDIANT":
        return "Étudiant";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Centre de Formation</h1>
                <p className="text-xs text-gray-500">Gestion pédagogique</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.prenom} {user.nom}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <Badge variant={getRoleBadgeVariant()}>
                  {getRoleLabel()}
                </Badge>
              </div>

              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet /> {/* 🔥 ICI: affichage des routes enfants */}
      </main>
    </div>
  );
}
