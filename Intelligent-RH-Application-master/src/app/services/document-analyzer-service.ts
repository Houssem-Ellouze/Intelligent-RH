import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {HealthResponse, RecommendResponse} from '../models/document';


@Injectable({
  providedIn: 'root',
})
export class DocumentAnalyzerService {
  private readonly baseUrl = 'http://localhost:5001';

  constructor(private http: HttpClient) {}

  // ─── GET / ────────────────────────────────────────────────────────────────
  /**
   * Récupère les questions disponibles depuis l'index.
   * Le backend renvoie du HTML ; on extrait ici la liste JSON si elle est
   * exposée séparément, sinon adaptez selon votre API.
   */
  getQuestions(): Observable<string[]> {
    // Si votre backend expose un endpoint JSON dédié, remplacez l'URL ci-dessous.
    return this.http
      .get<{ questions: string[] }>(`${this.baseUrl}/questions`)
      .pipe(
        map((res) => res.questions),
        catchError(this.handleError)
      );
  }

  // ─── POST /recommend ──────────────────────────────────────────────────────
  /**
   * Envoie un fichier (PDF / XLS / XLSX) et une question.
   * Retourne la question et la réponse générée par le modèle.
   */
  recommend(file: File, question: string): Observable<RecommendResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('text', question);

    return this.http
      .post<RecommendResponse>(`${this.baseUrl}/recommend`, formData)
      .pipe(catchError(this.handleError));
  }

  // ─── GET /health ──────────────────────────────────────────────────────────
  /**
   * Vérifie que l'API Flask est opérationnelle.
   */
  checkHealth(): Observable<HealthResponse> {
    return this.http
      .get<HealthResponse>(`${this.baseUrl}/health`)
      .pipe(catchError(this.handleError));
  }

  // ─── Error Handler ────────────────────────────────────────────────────────
  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Une erreur inattendue est survenue.';

    if (error.status === 0) {
      // Pas de connexion au serveur
      message = 'Impossible de contacter le serveur. Vérifiez que Flask tourne sur le port 5001.';
    } else if (error.error?.error) {
      // Message d'erreur renvoyé par Flask
      message = error.error.error;
    } else if (error.statusText) {
      message = `${error.status} – ${error.statusText}`;
    }

    return throwError(() => new Error(message));
  }
}
