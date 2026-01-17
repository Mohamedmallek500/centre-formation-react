import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { UserPlus, AlertCircle } from 'lucide-react';
import AuthService from './Services/authservices';
import { useNavigate, Link } from 'react-router-dom';

export function Register() {
    const navigate = useNavigate();
    const [role, setRole] = useState<'ETUDIANT' | 'FORMATEUR'>('ETUDIANT');
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        telephone: '',
        cin: '',
        photo: '',
        specialite: '' // Only for FORMATEUR
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleRoleChange = (value: 'ETUDIANT' | 'FORMATEUR') => {
        setRole(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const payload = {
            ...formData,
            role: role
        };

        // Remove specialite if role is ETUDIANT
        if (role === 'ETUDIANT') {
            delete (payload as any).specialite;
        }

        try {
            await AuthService.signup(payload);
            navigate('/'); // Redirect to login after successful registration
        } catch (err: any) {
            console.error("Registration error:", err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Erreur lors de l'inscription. Veuillez réessayer.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-lg shadow-xl">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                        <UserPlus className="w-10 h-10 text-white" />
                    </div>
                    <CardTitle className="text-3xl">Créer un compte</CardTitle>
                    <CardDescription>
                        Rejoignez notre plateforme de formation
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Role Selection */}
                        <div className="space-y-2">
                            <Label>Vous êtes ?</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    type="button"
                                    variant={role === 'ETUDIANT' ? 'default' : 'outline'}
                                    onClick={() => handleRoleChange('ETUDIANT')}
                                    className={role === 'ETUDIANT' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                                >
                                    Étudiant
                                </Button>
                                <Button
                                    type="button"
                                    variant={role === 'FORMATEUR' ? 'default' : 'outline'}
                                    onClick={() => handleRoleChange('FORMATEUR')}
                                    className={role === 'FORMATEUR' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                                >
                                    Formateur
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nom">Nom</Label>
                                <Input id="nom" value={formData.nom} onChange={handleChange} required placeholder="Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="prenom">Prénom</Label>
                                <Input id="prenom" value={formData.prenom} onChange={handleChange} required placeholder="John" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} required placeholder="john.doe@example.com" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input id="password" type="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="telephone">Téléphone</Label>
                                <Input id="telephone" value={formData.telephone} onChange={handleChange} required placeholder="12345678" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cin">CIN</Label>
                                <Input id="cin" value={formData.cin} onChange={handleChange} required placeholder="00112233" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="photo">Photo (URL ou Nom de fichier)</Label>
                            <Input id="photo" value={formData.photo} onChange={handleChange} placeholder="avatar.png" />
                        </div>

                        {role === 'FORMATEUR' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                                <Label htmlFor="specialite">Spécialité</Label>
                                <Select onValueChange={(value) => setFormData({ ...formData, specialite: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner une spécialité" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Data Science">Data Science</SelectItem>
                                        <SelectItem value="Développement Web">Développement Web</SelectItem>
                                        <SelectItem value="Réseaux & Sécurité">Réseaux & Sécurité</SelectItem>
                                        <SelectItem value="Cloud Computing">Cloud Computing</SelectItem>
                                        <SelectItem value="Intelligence Artificielle">Intelligence Artificielle</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 h-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                            {loading ? "Inscription en cours..." : "S'inscrire"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-gray-500">
                        Déjà un compte ? <Link to="/" className="text-blue-600 hover:underline">Se connecter</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
