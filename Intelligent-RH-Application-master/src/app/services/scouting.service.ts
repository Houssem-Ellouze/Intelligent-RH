import {HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TalentProfile } from '../models/talent-profile.model';
import { CompareRequest } from '../models/compare-request.model';
import { TalentComparison } from '../models/talent-comparison.model';
import { CandidatDTO } from '../models/candidat.model';
export interface TalentRanking {
  rank: number;
  candidatId: number | null;
  prenom: string;
  nom: string;
  scoreGlobal: number;
  potentiel: string; // <-- doit être string, PAS number
}


@Injectable({
  providedIn: 'root'
})


export class ScoutingService {

  private apiUrl = 'http://intelligent-rh:30222/api/scouting';

  constructor(private http: HttpClient) {}

  // À l'intérieur de la classe ScoutingService
  createOrUpdateProfile(prenom: string, nom: string, cvFile: File) {
    const formData = new FormData();
    formData.append('cv', cvFile); // Le backend doit attendre une clé nommée 'cv'

    // Utilisation de HttpParams ou template strings pour les Query Params
    return this.http.post<TalentProfile>(
      `${this.apiUrl}/profile?prenom=${prenom}&nom=${nom}`,
      formData
    );
  }



  getAllProfiles(): Observable<TalentProfile[]> {
    return this.http.get<TalentProfile[]>(`${this.apiUrl}/profiles`);
  }

  getProfileScore(prenom: string, nom: string): Observable<any> {
    // On construit les paramètres de requête pour correspondre au backend
    return this.http.get(`${this.apiUrl}/profile/score`, {
      params: { prenom, nom }
    });
  }

  // ───────────────────────────
  // COMPARAISON
  // ───────────────────────────

  compareTalents(prenomA: string, nomA: string, prenomB: string, nomB: string): Observable<any> {
    const params = new HttpParams()
      .set('prenomA', prenomA)
      .set('nomA', nomA)
      .set('prenomB', prenomB)
      .set('nomB', nomB);

    return this.http.post<any>(`${this.apiUrl}/compare`, null, { params });
  }

  getComparisonHistory(talentId: number): Observable<TalentComparison[]> {
    return this.http.get<TalentComparison[]>(
      `${this.apiUrl}/comparisons/${talentId}/history`
    );
  }
  getRanking(): Observable<TalentRanking[]> {
    return this.http.get<TalentRanking[]>(`${this.apiUrl}/ranking`);
  }
  updateProfileCV(prenom: string, nom: string, cvFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('prenom', prenom);
    formData.append('nom', nom);
    formData.append('cv', cvFile, cvFile.name);

    return this.http.patch(`${this.apiUrl}/profile/cv`, formData);
  }
  searchProfiles(minScore?: number, maxScore?: number, keyword?: string): Observable<TalentProfile[]> {
    let params = new HttpParams();
    if (minScore != null) params = params.set('minScore', minScore);
    if (maxScore != null) params = params.set('maxScore', maxScore);
    if (keyword) params = params.set('keyword', keyword);

    return this.http.get<TalentProfile[]>(`${this.apiUrl}/profiles/search`, { params });
  }

}
