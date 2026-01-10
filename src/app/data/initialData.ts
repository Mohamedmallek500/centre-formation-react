import { AppState, UserRole } from '../types';

// Données initiales pour démo
export const initialData: AppState = {
  users: [
    {
      id: '1',
      email: 'admin@formation.fr',
      password: 'admin123', // En production, utiliser un hash
      role: 'ADMIN' as UserRole,
      nom: 'Administrateur',
      prenom: 'Système'
    },
    {
      id: '2',
      email: 'prof.dupont@formation.fr',
      password: 'prof123',
      role: 'FORMATEUR' as UserRole,
      nom: 'Dupont',
      prenom: 'Jean'
    },
    {
      id: '3',
      email: 'martin@etudiant.fr',
      password: 'etudiant123',
      role: 'ETUDIANT' as UserRole,
      nom: 'Martin',
      prenom: 'Sophie'
    }
  ],
  
  specialites: [
    {
      id: 'spec1',
      nom: 'Informatique',
      code: 'INFO',
      description: 'Génie informatique et développement logiciel'
    },
    {
      id: 'spec2',
      nom: 'Réseaux et Télécommunications',
      code: 'RT',
      description: 'Administration réseaux et sécurité'
    },
    {
      id: 'spec3',
      nom: 'Intelligence Artificielle',
      code: 'IA',
      description: 'IA et Science des données'
    }
  ],

  sessions: [
    {
      id: 'sess1',
      nom: 'Semestre 1 - 2024/2025',
      dateDebut: '2024-09-01',
      dateFin: '2025-01-31',
      annee: '2024-2025'
    },
    {
      id: 'sess2',
      nom: 'Semestre 2 - 2024/2025',
      dateDebut: '2025-02-01',
      dateFin: '2025-06-30',
      annee: '2024-2025'
    }
  ],

  groupes: [
    {
      id: 'grp1',
      nom: 'TP1',
      type: 'TP',
      effectifMax: 20,
      etudiants: [],
      specialiteId: 'spec1'
    },
    {
      id: 'grp2',
      nom: 'TP2',
      type: 'TP',
      effectifMax: 20,
      etudiants: [],
      specialiteId: 'spec1'
    },
    {
      id: 'grp3',
      nom: 'TD1',
      type: 'TD',
      effectifMax: 30,
      etudiants: [],
      specialiteId: 'spec1'
    }
  ],

  formateurs: [
    {
      id: '2',
      nom: 'Dupont',
      prenom: 'Jean',
      specialite: 'Informatique',
      email: 'prof.dupont@formation.fr'
    },
    {
      id: 'f2',
      nom: 'Bernard',
      prenom: 'Marie',
      specialite: 'Réseaux',
      email: 'marie.bernard@formation.fr'
    },
    {
      id: 'f3',
      nom: 'Lefebvre',
      prenom: 'Pierre',
      specialite: 'Intelligence Artificielle',
      email: 'pierre.lefebvre@formation.fr'
    }
  ],

  etudiants: [
    {
      matricule: 'E2024001',
      nom: 'Martin',
      prenom: 'Sophie',
      email: 'martin@etudiant.fr',
      dateInscription: '2024-09-01',
      specialiteId: 'spec1',
      groupeId: 'grp1'
    },
    {
      matricule: 'E2024002',
      nom: 'Dubois',
      prenom: 'Lucas',
      email: 'lucas.dubois@etudiant.fr',
      dateInscription: '2024-09-01',
      specialiteId: 'spec1',
      groupeId: 'grp1'
    },
    {
      matricule: 'E2024003',
      nom: 'Lambert',
      prenom: 'Emma',
      email: 'emma.lambert@etudiant.fr',
      dateInscription: '2024-09-01',
      specialiteId: 'spec2',
      groupeId: 'grp2'
    }
  ],

  cours: [
    {
      code: 'INF101',
      titre: 'Programmation Java',
      description: 'Introduction à la programmation orientée objet avec Java',
      formateurId: '2',
      specialiteId: 'spec1',
      sessionId: 'sess1',
      etudiants: ['E2024001', 'E2024002']
    },
    {
      code: 'INF102',
      titre: 'Base de données',
      description: 'Conception et gestion de bases de données relationnelles',
      formateurId: '2',
      specialiteId: 'spec1',
      sessionId: 'sess1',
      etudiants: ['E2024001']
    },
    {
      code: 'RT201',
      titre: 'Administration Réseaux',
      description: 'Configuration et administration des réseaux informatiques',
      formateurId: 'f2',
      specialiteId: 'spec2',
      sessionId: 'sess1',
      etudiants: ['E2024003']
    }
  ],

  inscriptions: [
    {
      id: 'ins1',
      dateInscription: '2024-09-05',
      etudiantMatricule: 'E2024001',
      coursCode: 'INF101',
      statut: 'active'
    },
    {
      id: 'ins2',
      dateInscription: '2024-09-05',
      etudiantMatricule: 'E2024001',
      coursCode: 'INF102',
      statut: 'active'
    },
    {
      id: 'ins3',
      dateInscription: '2024-09-05',
      etudiantMatricule: 'E2024002',
      coursCode: 'INF101',
      statut: 'active'
    },
    {
      id: 'ins4',
      dateInscription: '2024-09-06',
      etudiantMatricule: 'E2024003',
      coursCode: 'RT201',
      statut: 'active'
    }
  ],

  notes: [
    {
      id: 'n1',
      valeur: 15.5,
      etudiantMatricule: 'E2024001',
      coursCode: 'INF101',
      dateAttribution: '2024-10-15',
      commentaire: 'Bon travail'
    },
    {
      id: 'n2',
      valeur: 17,
      etudiantMatricule: 'E2024001',
      coursCode: 'INF102',
      dateAttribution: '2024-10-20',
      commentaire: 'Excellent'
    },
    {
      id: 'n3',
      valeur: 14,
      etudiantMatricule: 'E2024002',
      coursCode: 'INF101',
      dateAttribution: '2024-10-15',
      commentaire: 'Bien'
    }
  ],

  seances: [
    {
      id: 'se1',
      coursCode: 'INF101',
      date: '2024-12-30',
      heureDebut: '08:00',
      heureFin: '10:00',
      salle: 'A101',
      groupeId: 'grp1'
    },
    {
      id: 'se2',
      coursCode: 'INF102',
      date: '2024-12-30',
      heureDebut: '10:00',
      heureFin: '12:00',
      salle: 'B202',
      groupeId: 'grp1'
    },
    {
      id: 'se3',
      coursCode: 'RT201',
      date: '2024-12-30',
      heureDebut: '14:00',
      heureFin: '16:00',
      salle: 'C303',
      groupeId: 'grp2'
    }
  ],

  currentUser: null
};
