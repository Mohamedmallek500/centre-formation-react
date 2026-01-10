// src/app/routes/ProtectedRoutes.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "./context/AppContext";

export default function ProtectedRoutes() {
  const { state } = useApp();

  if (!state.currentUser) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
