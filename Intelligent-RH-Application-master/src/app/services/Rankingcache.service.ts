// src/app/services/ranking-cache.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TalentRanking } from './scouting.service';

@Injectable({ providedIn: 'root' })
export class RankingCacheService {

  // BehaviorSubject : conserve la dernière valeur même après navigation
  private rankingSubject = new BehaviorSubject<TalentRanking[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(true);
  private errorSubject   = new BehaviorSubject<string>('');

  // Timestamp du dernier chargement (évite de recharger si données fraîches)
  private lastFetch: number | null = null;
  private readonly CACHE_TTL_MS = 30_000; // 30 secondes

  readonly ranking$ = this.rankingSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$   = this.errorSubject.asObservable();

  get ranking()      { return this.rankingSubject.getValue(); }
  get isLoading()    { return this.loadingSubject.getValue(); }
  get errorMessage() { return this.errorSubject.getValue(); }

  setLoading(v: boolean)       { this.loadingSubject.next(v); }
  setError(msg: string)        { this.errorSubject.next(msg); }
  setRanking(data: TalentRanking[]) {
    this.rankingSubject.next(data);
    this.lastFetch = Date.now();
  }

  /** Retourne true si le cache est encore frais → pas besoin de refetch */
  isFresh(): boolean {
    return this.lastFetch !== null
      && (Date.now() - this.lastFetch) < this.CACHE_TTL_MS
      && this.ranking.length > 0;
  }
}
