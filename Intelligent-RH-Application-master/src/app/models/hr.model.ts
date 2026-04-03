export enum TypeCompetence {
  HARD_SKILL = 'HARD_SKILL',
  SOFT_SKILL = 'SOFT_SKILL'
}

export enum NiveauExpertise {
  DEBUTANT = 'DEBUTANT',
  INTERMEDIAIRE = 'INTERMEDIAIRE',
  EXPERT = 'EXPERT'
}
export enum StatutCandidat {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS_ENTRETIEN = 'EN_COURS_ENTRETIEN',
  EN_COURS_TEST_TECHNIQUE = 'EN_COURS_TEST_TECHNIQUE',
  EN_COURS_REFERENCE_CHECK = 'EN_COURS_REFERENCE_CHECK',
  EN_ATTENTE_DECISION = 'EN_ATTENTE_DECISION',
  ACCEPTE = 'ACCEPTE',
  REFUSE = 'REFUSE',
  EN_STANDBY = 'EN_STANDBY',
  NO_SHOW = 'NO_SHOW',
  CANDIDAT_DECLINE = 'CANDIDAT_DECLINE'
}

export interface HistoriqueStatut {
  statut: StatutCandidat;
  dateChangement: Date;
  commentaire?: string;
  modifiePar?: string;
}

export enum DomainePrincipale {
  DEVELOPPEMENT_WEB = 'DEVELOPPEMENT_WEB',
  CLOUD = 'CLOUD',
  DATA_SCIENCE = 'DATA_SCIENCE',
  CYBERSECURITE = 'CYBERSECURITE',
  MOBILE = 'MOBILE',
  DEVOPS = 'DEVOPS',
  INTELLIGENCE_ARTIFICIELLE = 'INTELLIGENCE_ARTIFICIELLE',
  TEST_ET_QA = 'TEST_ET_QA',
  DESIGN_UX_UI = 'DESIGN_UX_UI'
}

// Mapping pour retrouver les labels "lisibles" (équivalent du constructeur Java)
export const DomainePrincipaleLabels: Record<DomainePrincipale, string> = {
  [DomainePrincipale.DEVELOPPEMENT_WEB]: 'Développement Web',
  [DomainePrincipale.CLOUD]: 'Cloud Computing',
  [DomainePrincipale.DATA_SCIENCE]: 'Data Science',
  [DomainePrincipale.CYBERSECURITE]: 'Cybersécurité',
  [DomainePrincipale.MOBILE]: 'Développement Mobile',
  [DomainePrincipale.DEVOPS]: 'DevOps & Infrastructure',
  [DomainePrincipale.INTELLIGENCE_ARTIFICIELLE]: 'IA & Machine Learning',
  [DomainePrincipale.TEST_ET_QA]: 'Test et Qualité Logicielle',
  [DomainePrincipale.DESIGN_UX_UI]: 'Design UX/UI'
};

export interface Competence {
  id?: number;
  libelle: string;
  type: TypeCompetence;
  niveauDeclare: NiveauExpertise;
}

export interface Candidat {
  fileName?: string;
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  posteActuel?:string;
  domainePrincipale?:string;
  lienCV?: string;
  lienGitHub?: string;
  lienLinkedin?: string;
  anneesExperience: number;
  dateCreation: string; // ISO string
  consentementDonnees: boolean;
  competences: Competence[];
  status : string
}
