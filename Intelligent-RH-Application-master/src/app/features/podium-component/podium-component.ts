// src/app/features/podium/podium.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TalentRanking } from '../../services/scouting.service';

@Component({
  selector: 'app-podium',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './podium-component.html',
  styleUrls: ['./podium-component.scss']
})
export class PodiumComponent implements OnChanges {

  @Input() ranking: TalentRanking[] = [];

  top3:      TalentRanking[] = [];
  particles: string[] = [];
  confetti:  string[] = [];

  // ngOnChanges se déclenche à CHAQUE fois que @Input ranking change
  // → fonctionne même si les données arrivent après le premier rendu
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ranking'] && this.ranking?.length >= 3) {
      this.top3      = this.ranking.slice(0, 3);
      this.particles = this.makeParticles(18);
      this.confetti  = this.makeConfetti(14);
    }
  }


  getInitials(t: TalentRanking): string {
    return ((t.prenom ?? '?')[0] + (t.nom ?? '?')[0]).toUpperCase();
  }

  barWidth(score: number): number {
    const max = this.top3[0]?.scoreGlobal || 100;
    return Math.round((score / max) * 100);
  }

  chipClass(potentiel: string): string {
    switch ((potentiel ?? '').toUpperCase()) {
      case 'EXCELLENT': case 'ELITE': case 'HAUT': case 'HIGH': return 'chip-green';
      case 'MOYEN':     case 'MEDIUM':                           return 'chip-yellow';
      default:                                                   return 'chip-red';
    }
  }

  private makeParticles(n: number): string[] {
    const cols = ['#f5c842','#c0c8e0','#cd7f32','#818cf8','#38bdf8'];
    return Array.from({ length: n }, (_, i) => {
      const c = cols[i % cols.length];
      const s = 2 + Math.random() * 4;
      return `left:${(i / n) * 100}%;width:${s}px;height:${s}px;` +
        `background:${c};animation-delay:${(Math.random() * 12).toFixed(1)}s;` +
        `animation-duration:${(9 + Math.random() * 8).toFixed(1)}s`;
    });
  }

  private makeConfetti(n: number): string[] {
    const cols = ['#f5c842','#ffe680','#fff','#a78bfa','#38bdf8','#f472b6'];
    return Array.from({ length: n }, (_, i) => {
      const angle  = (i / n) * 360;
      const radius = 70 + Math.random() * 35;
      const size   = 4 + Math.random() * 5;
      return `--a:${angle}deg;--r:${radius}px;width:${size}px;height:${size}px;` +
        `background:${cols[i % cols.length]};animation-delay:${(i * 0.08).toFixed(2)}s`;
    });
  }
}
