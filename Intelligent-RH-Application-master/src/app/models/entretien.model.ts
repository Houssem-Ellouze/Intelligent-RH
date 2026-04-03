// Interface pour un entretien d'une candidature
import {Candidature} from './candidature.model';
import {Candidat} from './hr.model';

export interface Entretien {
  id?: number;                     // facultatif, vient de la base de données
  dateHeure: string;               // la date + heure au format ISO (ex: "2026-01-29T14:30:00")
  intervieweur?: string;           // nom de l'intervieweur (facultatif)
  feedbackTechnique?: string;      // commentaires techniques (facultatif)
  noteGlobale?: number;            // note globale de l'entretien (facultatif)
  infos_candidat?: Candidat[]
}
