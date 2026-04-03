export interface DossierComplet {
  candidature_id: number;
  etat_actuel: string;
  offre_concernee: string;
  candidat_id: number;
  infos_candidat: any; // On peut mettre une interface Candidat si elle existe
  historique_entretiens: any[];
}
