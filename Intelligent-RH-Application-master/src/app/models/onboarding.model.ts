import {Candidat} from './hr.model';

export enum StatutIntegration {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  ANNULE = 'ANNULE'
}

export interface Contrat {
  id?: number;
  salaireBrut: number;
  dateDebut: Date;
  dureePeriodeEssai: number;
  typeContrat: string;
}

export interface Departement {
  id?: number;
  nom: string;
  responsableNom: string;
}

export interface TacheIntegration {
  id?: number;
  estRealisee: boolean;
  responsableTache: string;
  dateEcheance: Date;
  libelle: string;
}

export interface Collaborateur {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  emailPro: string;
  statutOnboarding: StatutIntegration;
  contrat: Contrat;
  departement: Departement;
  taches: TacheIntegration[];
  dateCreation?: string;
  candidat?: Candidat;  // ✅ rendu optionnel pour éviter erreurs


}
