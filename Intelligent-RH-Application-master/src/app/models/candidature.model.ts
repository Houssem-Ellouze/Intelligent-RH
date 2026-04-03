import { Entretien } from './entretien.model';
import { Candidat } from './hr.model';

// Enum pour l'état d'une candidature
export enum EtatCandidature {
  NOUVELLE = 'NOUVELLE',
  ENTRETIEN_EN_COURS = 'ENTRETIEN_EN_COURS',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE'
}

// Interface pour l'historique des entretiens
export interface HistoriqueEntretien {
  id: number;
  dateHeure: string | null;
  intervieweur: string | null;
  feedbackTechnique: string | null;
  noteGlobale: number | null;
}

// Interface pour la candidature
export interface Candidature {
  id?: number;
  candidatId: number; // Référence vers le service Talent
  datePostulation?: Date | string;
  etat: EtatCandidature;
  entretiens?: Entretien[] | null;
  infos_candidat?: Candidat | null;
  historique_entretiens?: HistoriqueEntretien[] | null;
  // On ne met pas l'objet 'offre' ici pour éviter les boucles circulaires côté Backend
}

// Fonction utilitaire pour extraire les dates d'entretien de manière sécurisée
export function extractDatesEntretiens(candidatures: Candidature[] | null | undefined): string[] {
  if (!Array.isArray(candidatures)) {
    return [];
  }

  return candidatures.flatMap(c => {
    // Vérifier que l'historique existe et est un tableau
    if (!c || !Array.isArray(c.historique_entretiens)) {
      return [];
    }

    // Mapper et filtrer les dates non-null
    return c.historique_entretiens
      .map(e => e?.dateHeure)
      .filter((d): d is string => d !== null && d !== undefined);
  });
}

// Fonction utilitaire pour extraire les dates depuis les entretiens directs
export function extractDatesFromEntretiens(candidatures: Candidature[] | null | undefined): Date[] {
  if (!Array.isArray(candidatures)) {
    return [];
  }

  return candidatures.flatMap(c => {
    // Vérifier que les entretiens existent et sont un tableau
    if (!c || !Array.isArray(c.entretiens)) {
      return [];
    }

    // Mapper et filtrer les dates valides
    return c.entretiens
      .map(e => e?.dateHeure)
      .filter((d): d is string => d !== null && d !== undefined)
      .map(dateStr => new Date(dateStr));
  });
}

// Fonction utilitaire pour vérifier si une candidature a des entretiens
export function hasEntretiens(candidature: Candidature | null | undefined): boolean {
  return !!(
    candidature &&
    Array.isArray(candidature.entretiens) &&
    candidature.entretiens.length > 0
  );
}

// Fonction utilitaire pour obtenir le nombre d'entretiens
export function getEntretiensCount(candidature: Candidature | null | undefined): number {
  if (!candidature || !Array.isArray(candidature.entretiens)) {
    return 0;
  }
  return candidature.entretiens.length;
}
