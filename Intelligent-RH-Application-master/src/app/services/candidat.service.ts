import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Candidat } from '../models/hr.model';
@Injectable({ providedIn: 'root' })
export class CandidatService {
  private readonly url = 'http://intelligent-rh:30222/api/candidats';
  private _candidats$ = new BehaviorSubject<Candidat[]>([]);
  public candidats$ = this._candidats$.asObservable();

  constructor(private http: HttpClient) {
    this.loadAll();
  }

  loadAll(): void {
    this.http.get<Candidat[]>(this.url).subscribe(data => this._candidats$.next(data));
  }

  getById(id: number): Observable<Candidat> {
    return this.http.get<Candidat>(`${this.url}/${id}`);
  }

  // Changement ici : On accepte FormData
  create(formData: FormData): Observable<Candidat> {
    return this.http.post<Candidat>(`${this.url}/create`, formData).pipe(
      tap(() => this.loadAll())
    );
  }

  update(id: number, candidat: FormData): Observable<Candidat> {
    return this.http.put<Candidat>(`${this.url}/${id}`, candidat).pipe(
      tap(() => this.loadAll())
    );
  }
  getAll(): Observable<Candidat[]> {
    return this.http.get<Candidat[]>(this.url);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      tap(() => this.loadAll())
    );
  }
  // candidat.service.ts

  downloadCv(fileName: string): Observable<Blob> {
    // Vérifiez bien le slash entre files et get
    return this.http.get(`http://intelligent-rh:30222/files/get/${fileName}`, {
      responseType: 'blob'
    });
  }


  getFileUrl(fileName: string | undefined): string {
    // Si fileName est null, undefined ou vide, on renvoie tout de suite le fallback
    if (!fileName || fileName.trim() === '' || fileName === 'null') {
      return 'https://ui-avatars.com/api/?name=Unknown&background=ccc';
    }

    // On nettoie le fileName au cas où il contient un chemin complet
    const cleanName = fileName.split('/').pop();

    return `http://intelligent-rh:30222/files/get/${cleanName}`;
  }
  getAllPaginated(page: number, size: number): Observable<any> {
    return this.http.get(`${this.url}/all?page=${page}&size=${size}`);
  }
  getByDate(date: Date) {
    const formatted = date.toISOString().split('T')[0];
    return this.http.get<Candidat[]>(
      `${this.url}/by-date?date=${formatted}`
    );
  }
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.url}/dashboard`);
  }
}
