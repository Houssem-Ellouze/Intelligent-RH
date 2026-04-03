import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {DossierComplet} from '../models/dossier-complet.model';
import {Entretien} from '../models/entretien.model';
import {Candidature} from '../models/candidature.model';

@Injectable({ providedIn: 'root' })
export class RecrutementService {
  private apiUrl = 'http://intelligent-rh:30222/api/recrutement';

  constructor(private http: HttpClient) {}

  // Gestion des Offres
  getOffresActives(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/offres/actives`);
  }

  creerOffre(offre: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/offres`, offre);
  }

  getCandidaturesByDateRdv(): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.apiUrl}/candidatures/rdv`);
  }

  getAllCandidatures(): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.apiUrl}/dossiers-complets`);
  }

  postuler(offreId: number, prenom: string, nom: string): Observable<Candidature> {
    const params = new HttpParams()
      .set('offreId', offreId.toString())
      .set('prenom', prenom)
      .set('nom', nom);

    return this.http.post<Candidature>(`http://intelligent-rh:30222/api/recrutement/postuler`, null, { params });
  }

  modifierStatut(id: number, statut: string): Observable<any> {
    const params = new HttpParams().set('statut', statut);
    return this.http.patch(`${this.apiUrl}/candidatures/${id}/statut`, {}, { params, responseType: 'text' });
  }

  getDossierComplet(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/candidatures/${id}/dossier`);
  }
  getDossiersComplets(): Observable<DossierComplet[]> {
    return this.http.get<DossierComplet[]>(`${this.apiUrl}/dossiers-complets`);
  }
  mettreAJourStatut(id: number, etat: string, note: number, commentaire: string) {
    const params = {
      etat: etat,
      note: note.toString(),
      commentaire: commentaire
    };

    return this.http.patch(`${this.apiUrl}/statut/${id}`, null, { params });
  }

  /**
   * Planifie un entretien et fait passer la candidature en ENTRETIEN_EN_COURS
   */
  planifierEntretien(id: number, entretien: { dateEntretien: string; notes: string }): Observable<Entretien> {
    return this.http.post<Entretien>(`${this.apiUrl}/candidatures/${id}/entretiens`, entretien);
  }
  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }

}
