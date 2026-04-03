// src/app/features/ranking-component/ranking-component.ts
import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoutingService, TalentRanking } from '../../services/scouting.service';
import { PodiumComponent } from '../podium-component/podium-component';
import { timeout, catchError } from 'rxjs/operators';
import { Subscription, of } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking-component.html',
  standalone: true,
  imports: [CommonModule, PodiumComponent, RouterLink],
  styleUrls: ['./ranking-component.scss']
})
export class RankingComponent implements OnInit, OnDestroy {

  ranking:     TalentRanking[] = [];
  loading      = true;
  errorMessage = '';

  private subs         = new Subscription();
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private scoutingService: ScoutingService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchRanking();
    this.refreshTimer = setInterval(() => this.fetchRanking(), 30_000);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.refreshTimer !== null) clearInterval(this.refreshTimer);
  }

  fetchRanking(): void {
    this.loading      = true;
    this.errorMessage = '';

    const sub = this.scoutingService.getRanking()
      .pipe(
        timeout(10_000),
        catchError(err => {
          console.error('❌ API ranking error:', err);
          return of(null);
        })
      )
      .subscribe(data => {
        // ✅ Tout dans zone.run() pour forcer la détection Angular
        this.zone.run(() => {

          if (data === null) {
            this.errorMessage = 'Impossible de charger le classement';
            this.ranking      = [];   // ✅ nouveau tableau
            this.loading      = false;
            this.cdr.detectChanges();
            return;
          }

          // ✅ [...] crée un nouveau tableau → ngOnChanges du PodiumComponent se déclenche
          this.ranking = [...(data as TalentRanking[]).map(t => ({
            rank:        t.rank        ?? 0,
            candidatId:  t.candidatId  ?? null,
            nom:         t.nom         ?? 'Inconnu',
            prenom:      t.prenom      ?? 'Inconnu',
            scoreGlobal: t.scoreGlobal ?? 0,
            potentiel:   t.potentiel   ? t.potentiel.toUpperCase() : 'FAIBLE'
          }))];

          this.loading = false;
          this.cdr.detectChanges(); // ✅ force le re-render du template
          console.log('✅ ranking chargé :', this.ranking.length, 'talents');
        });
      });

    this.subs.add(sub);
  }

  getPotentielClass(potentiel: string): string {
    switch ((potentiel ?? '').toUpperCase()) {
      case 'EXCELLENT': case 'ELITE': case 'HAUT': case 'HIGH': return 'badge-elite';
      case 'MOYEN':     case 'MEDIUM':                           return 'badge-medium';
      case 'FAIBLE':    case 'LOW':                              return 'badge-low';
      default:                                                   return 'badge-medium';
    }
  }
}
