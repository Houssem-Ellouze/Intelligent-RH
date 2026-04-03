import {Candidature} from './candidature.model';

export enum StatutOffre {
  PUBLIEE = 'PUBLIEE',
  CLOTUREE = 'CLOTUREE',
  ANNULEE = 'ANNULEE'
}

export interface OffreEmploi {
  id?: number; // Optionnel car absent lors de la création
  titre: string;
  description: string;
  datePublication: Date | string; // Spring LocalDate arrive souvent en string (ISO)
  statut: StatutOffre;
  candidatures?: Candidature[]; // Liste liée
}

