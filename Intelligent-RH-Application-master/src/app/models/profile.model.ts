// profile.model.ts
export interface UserProfile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  matricule: string;
  poste?: string;
  departement?: string;
  github?: string;
  linkedin?: string;
  cv?: string;
  avatar?: string;        // base64 ou URL
  bio?: string;
  competences?: string[];
  dateCreation: Date;
  statut: 'actif' | 'inactif' | 'en_attente';
}
