// src/app/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { Login } from "./components/Login";
import { Layout } from "./components/Layout";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { FormateurDashboard } from "./components/formateur/FormateurDashboard";
import { EtudiantDashboard } from "./components/etudiant/EtudiantDashboard";
import { EtudiantsManager } from "./components/admin/EtudiantsManager";
import ProtectedRoutes from "./ProtectedRoutes";
import { JSX } from "react";
import { FormateursManager } from "./components/admin/FormateursManager";

// 🔁 Redirection selon rôle
function RoleRedirect() {
  const { state } = useApp();
  const role = state.currentUser?.roles?.[0];

  if (role === "ADMIN") return <Navigate to="/dashboardadmin" replace />;
  if (role === "FORMATEUR") return <Navigate to="/dashboardformateur" replace />;
  if (role === "ETUDIANT") return <Navigate to="/dashboardetudiant" replace />;

  return <Navigate to="/" replace />;
}

// 🔒 Garde simple par rôle
function RequireRole({ allowed, children }: { allowed: string[]; children: JSX.Element }) {
  const { state } = useApp();
  const role = state.currentUser?.roles?.[0];

  if (!role) return <Navigate to="/" replace />;
  if (!allowed.includes(role)) return <Navigate to="/dashboard" replace />;

  return children;
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>

          {/* Public */}
          <Route path="/" element={<Login />} />

          {/* Auth required */}
          <Route element={<ProtectedRoutes />}>
            <Route element={<Layout />}>

              {/* Redirection automatique */}
              <Route path="/dashboard" element={<RoleRedirect />} />

              {/* ================= ADMIN ================= */}
              <Route
                path="/dashboardadmin"
                element={
                  <RequireRole allowed={["ADMIN"]}>
                    <AdminDashboard />
                  </RequireRole>
                }
              />

              {/* 👉 NOUVELLE ROUTE ADMIN */}
              <Route
                path="/dashboardadmin/etudiants"
                element={
                  <RequireRole allowed={["ADMIN"]}>
                    <EtudiantsManager />
                  </RequireRole>
                }
              />

              <Route
  path="/dashboardadmin/formateurs"
  element={
    <RequireRole allowed={["ADMIN"]}>
      <FormateursManager />
    </RequireRole>
  }
/>

              {/* ================= FORMATEUR ================= */}
              <Route
                path="/dashboardformateur"
                element={
                  <RequireRole allowed={["FORMATEUR"]}>
                    <FormateurDashboard />
                  </RequireRole>
                }
              />

              {/* ================= ETUDIANT ================= */}
              <Route
                path="/dashboardetudiant"
                element={
                  <RequireRole allowed={["ETUDIANT"]}>
                    <EtudiantDashboard />
                  </RequireRole>
                }
              />

            </Route>
          </Route>

        </Routes>
      </Router>
    </AppProvider>
  );
}
