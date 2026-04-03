import { Injectable } from '@angular/core';

// ── Interfaces (identiques au composant) ────────
interface TopJob {
  job: string;
  score: number;
}

export interface CVResult {
  best_job: string;
  match_percentage: number;
  skills: Record<string, number>;
  top_jobs: TopJob[];
}

interface CacheEntry {
  result: CVResult;
  timestamp: number;
  fileName: string;
}

// ────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class RhPredictionCacheService {

  /** Durée de vie du cache : 30 minutes */
  private readonly TTL_MS = 30 * 60 * 1000;

  private store = new Map<string, CacheEntry>();

  // ── Clé unique par fichier ───────────────────
  /**
   * Construit une clé à partir de : nom + taille + lastModified
   * → deux fichiers différents ne partagent jamais la même clé
   */
  buildKey(file: File): string {
    return `${file.name}__${file.size}__${file.lastModified}`;
  }

  // ── Lecture ──────────────────────────────────
  /**
   * Retourne CVResult si en cache et non expiré, sinon null.
   * Supprime automatiquement les entrées expirées.
   */
  get(key: string): CVResult | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.TTL_MS) {
      this.store.delete(key);
      return null;
    }

    return entry.result;
  }

  // ── Écriture ─────────────────────────────────
  /**
   * Stocke un CVResult après un appel HTTP réussi.
   * Appelé dans uploadCV() → next: (res) => { this.cache.set(key, res); }
   */
  set(key: string, result: CVResult, fileName = ''): void {
    this.store.set(key, {
      result,
      timestamp: Date.now(),
      fileName
    });
  }

  // ── Vérification ─────────────────────────────
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // ── Suppression ──────────────────────────────
  delete(key: string): void {
    this.store.delete(key);
  }

  /** Vide tout le cache (ex: bouton "Réinitialiser tout") */
  clear(): void {
    this.store.clear();
  }

  // ── Infos ────────────────────────────────────
  get size(): number {
    return this.store.size;
  }

  /** Liste les entrées encore valides */
  listValid(): { key: string; fileName: string; age: string }[] {
    const now = Date.now();
    return Array.from(this.store.entries())
      .filter(([, e]) => now - e.timestamp <= this.TTL_MS)
      .map(([key, e]) => ({
        key,
        fileName: e.fileName,
        age: `${Math.round((now - e.timestamp) / 1000)}s`
      }));
  }
}
