// Types et interfaces pour l'application

export type ERole = "ADMIN" | "FORMATEUR" | "ETUDIANT";

export type StatutInscription = "EN_ATTENTE" | "VALIDEE" | "REFUSEE";

export type TypeNote = "DS" | "EXAM" | "TP";

export type TypeSeance = "CM" | "TD" | "TP";

export interface Role {
  id: number;
  name: ERole;
}

export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  motDePasse?: string; // idéalement jamais envoyé par l'API
  role: Role;
  roles: ERole[];   // 🔥 au lieu de role: Role
  telephone?: string;
  photo?: string;
  cin?: string;
}

export interface Admin extends Utilisateur {}

export interface Etudiant extends Utilisateur {
  matricule: string;
  dateInscription: string; // LocalDateTime -> string ISO
}


export interface Formateur extends Utilisateur {
  specialite: string;
  cours?: Cours[];
}


export interface Cours {
  id: number;
  code: string;
  titre: string;
  description?: string;
  nbHeures: number;
  coefficient: number;
  formateur?: Formateur;
  groupeCours?: GroupeCours[];
}


export interface Groupe {
  id: number;
  nom: string;
  sessionPedagogique?: SessionPedagogique;
  groupeCours?: GroupeCours[];
}


export interface GroupeCours {
  id: number;
  groupe: Groupe;
  cours: Cours;
  volumeHoraire: number;
  coefficient: number;
}


export interface Inscription {
  id: number;
  dateInscription: string; // LocalDate -> string
  statut: StatutInscription;
  etudiant: Etudiant;
  groupe: Groupe;
}

export interface Note {
  id: number;
  valeur: number;
  typeNote: TypeNote;
  etudiant: Etudiant;
  cours: Cours;
}


export interface Seance {
  id: number;
  heureDebut: string; // LocalDateTime -> string
  heureFin: string;
  salle: string;
  typeSeance: TypeSeance;
  cours?: Cours;
  groupe?: Groupe;
}


export interface SessionPedagogique {
  id: number;
  annee: string;    // "2025-2026"
  semestre: string; // "S1", "S2"
  groupes?: Groupe[];
}





















