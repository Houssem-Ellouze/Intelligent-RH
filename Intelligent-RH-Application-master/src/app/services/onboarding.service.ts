import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import { Collaborateur } from '../models/onboarding.model';

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private apiUrl = 'http://intelligent-rh:30222/api/onboarding';

  constructor(private http: HttpClient) { }

  // Liste tous les collaborateurs
  getAllCollaborateurs(): Observable<Collaborateur[]> {
    return this.http.get<Collaborateur[]>(`${this.apiUrl}/all`);
  }

  // Utilisation de HttpParams pour une URL propre et sécurisée
  transformerCandidat(id: number, metier: string, nom: string, prenom: string): Observable<string> {
    // Validation des paramètres requis
    if (!id) {
      return throwError(() => new Error('ID candidat requis'));
    }

    if (!metier || metier.trim() === '') {
      return throwError(() => new Error('Métier requis'));
    }

    // Option 1: Avec HttpParams dans l'URL
    const params = new HttpParams()
      .set('metier', metier)
      .set('nom', nom || '')
      .set('prenom', prenom || '');

    const url = `${this.apiUrl}/transformer/${id}`;

    return this.http.post(url, {}, {
      params,
      responseType: 'text',
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      catchError(error => {
        console.error('Erreur transformation:', error);
        return throwError(() => new Error('Échec de la transformation: ' + error.message));
      })
    );

  }
  finaliser(id: number): Observable<string> {
    const url = `${this.apiUrl}/finaliser/${id}`;
    return this.http.put(url, {}, { responseType: 'text' });
  }
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
  saveSignature(id: number, signatureBase64: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/signature`, { id, signature: signatureBase64 }, { responseType: 'text' });
  }

  uploadQR(imageBase64: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/uploadQR`, { imageData: imageBase64 });
  }
}
