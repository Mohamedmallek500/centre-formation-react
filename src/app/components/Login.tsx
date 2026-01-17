import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { GraduationCap, AlertCircle } from 'lucide-react';
import AuthService from './Services/authservices';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from "react-router-dom"; // 🔥

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useApp();
  const navigate = useNavigate(); // 🔥

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await AuthService.signin({ email, password });

      console.log("User connected:", response.data);
      // Le cookie HTTP-only est automatiquement stocké par le navigateur

      // 🔥 Stocker l'utilisateur
      login(response.data);

      // 🔁 Redirection selon le rôle
      const role = response.data.roles?.[0]; // ex: "ETUDIANT"

      if (role === "ADMIN") navigate("/dashboardadmin");
      else if (role === "FORMATEUR") navigate("/dashboardformateur");
      else if (role === "ETUDIANT") navigate("/dashboardetudiant");
      else navigate("/");

    } catch (err: any) {
      console.error("Login error:", err);

      if (err.response && err.response.status === 401) {
        setError("Email ou mot de passe incorrect");
      } else {
        setError("Erreur serveur. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl">Gestion Formation</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder à votre espace
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@formation.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-500">
            Pas encore de compte ? <Link to="/register" className="text-blue-600 hover:underline">Créer un compte</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
