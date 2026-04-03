import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { forkJoin, Subject, of } from 'rxjs';
import { takeUntil, timeout, catchError } from 'rxjs/operators';
import { NgForOf, NgIf } from '@angular/common';
import { CandidatService } from '../../services/candidat.service';
import { OnboardingService } from '../../services/onboarding.service';
import { RecrutementService } from '../../services/recrutement-service';
import { RouterLink } from '@angular/router';

Chart.register(...registerables);

interface DashboardTab { id: string; label: string; }

@Component({
  selector: 'app-all-stats',
  templateUrl: './global-stats.html',
  styleUrls: ['./global-stats.scss'],
  standalone: true,
  imports: [NgForOf, NgIf, RouterLink]
})
export class GlobalStatsComponent implements OnInit, OnDestroy {

  stats: any = {};
  loading   = true;
  error     = false;
  activeTab = 'candidats';

  private destroy$       = new Subject<void>();
  private chartInstances: { [key: string]: Chart } = {};

  tabs: DashboardTab[] = [
    { id: 'candidats',   label: 'Candidat'    },
    { id: 'recrutement', label: 'Recrutement' },
    { id: 'onBoarding',  label: 'OnBoarding'  }
  ];

  constructor(
    private candidatService:      CandidatService,
    private collaborateurService: OnboardingService,
    private statsService:         RecrutementService,
    private cdr:                  ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.loadDashboardData(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyAllCharts();
  }

  // ── Onglet ──────────────────────────────────────────────────────
  setActiveTab(tabId: string): void {
    this.destroyAllCharts();
    this.activeTab = tabId;
    this.cdr.detectChanges();           // ✅ rend les canvas dans le DOM

    // ✅ double rAF : attend que le navigateur ait réellement peint le DOM
    requestAnimationFrame(() => requestAnimationFrame(() => {
      switch (tabId) {
        case 'candidats':   this.initCandidatCharts();   break;
        case 'recrutement': this.initRecrutementCharts(); break;
        case 'onBoarding':  this.initOnBoardingCharts();  break;
      }
    }));
  }

  // ── Chargement ──────────────────────────────────────────────────
  loadDashboardData(): void {
    this.loading = true;
    this.error   = false;

    forkJoin([
      this.candidatService.getDashboardStats().pipe(
        timeout(10000), catchError(err => { console.error('❌ candidat:', err); return of({}); })
      ),
      this.collaborateurService.getDashboardStats().pipe(
        timeout(10000), catchError(err => { console.error('❌ onboarding:', err); return of({}); })
      ),
      this.statsService.getStats().pipe(
        timeout(10000), catchError(err => { console.error('❌ recrutement:', err); return of({}); })
      )
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([candidatsStats, collaborateursStats, recrutementStats]) => {
          this.stats   = { ...candidatsStats, ...collaborateursStats, ...recrutementStats };
          this.loading = false;
          this.cdr.detectChanges();       // ✅ affiche le DOM (canvas candidats)

          // ✅ double rAF après detectChanges → canvas garanti dans le DOM
          requestAnimationFrame(() => requestAnimationFrame(() => {
            this.initCandidatCharts();
          }));
        },
        error: (err) => {
          console.error('❌ forkJoin:', err);
          this.error   = true;
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  // ── Destroy ─────────────────────────────────────────────────────
  private destroyAllCharts(): void {
    Object.keys(this.chartInstances).forEach(key => {
      this.chartInstances[key]?.destroy();
      delete this.chartInstances[key];
    });
  }

  private destroyChart(id: string): void {
    if (this.chartInstances[id]) {
      this.chartInstances[id].destroy();
      delete this.chartInstances[id];
    }
  }

  // ✅ Résolution centralisée du canvas — log si absent
  private getCanvas(id: string): HTMLCanvasElement | null {
    const el = document.getElementById(id) as HTMLCanvasElement | null;
    if (!el) console.warn(`⚠️ Canvas #${id} introuvable dans le DOM`);
    return el;
  }

  // ═══════════════════════════════════════════════════════════════
  //  CANDIDATS
  // ═══════════════════════════════════════════════════════════════
  initCandidatCharts(): void {
    if (!this.stats) return;

    if (this.stats.candidatsParMois && Object.keys(this.stats.candidatsParMois).length > 0)
      this.createHorizontalBarChart('candidatsParMoisChart', 'Candidats par Mois',
        Object.keys(this.stats.candidatsParMois), Object.values(this.stats.candidatsParMois));

    if (this.stats.moyenneCompetencesParMois && Object.keys(this.stats.moyenneCompetencesParMois).length > 0)
      this.createDoughnutChart('moyenneCompetencesParMoisChart', 'Moyenne Compétences',
        Object.keys(this.stats.moyenneCompetencesParMois), Object.values(this.stats.moyenneCompetencesParMois));

    if (this.stats.candidatsParExperience && Object.keys(this.stats.candidatsParExperience).length > 0)
      this.createPieChart('candidatsParExperienceChart', 'Répartition par Expérience',
        Object.keys(this.stats.candidatsParExperience), Object.values(this.stats.candidatsParExperience));
  }

  // ═══════════════════════════════════════════════════════════════
  //  ONBOARDING
  // ═══════════════════════════════════════════════════════════════
  private initOnBoardingCharts(): void {
    if (!this.stats) return;

    if (this.stats.collaborateursParMois && Object.keys(this.stats.collaborateursParMois).length > 0)
      this.createPieChart('collaborateursParMoisChart', 'Collaborateurs par Mois',
        Object.keys(this.stats.collaborateursParMois), Object.values(this.stats.collaborateursParMois));

    if (this.stats.moyenneTachesParMois && Object.keys(this.stats.moyenneTachesParMois).length > 0)
      this.createHorizontalBarChart('moyenneTachesParMoisChart', 'Moyenne Tâches par Mois',
        Object.keys(this.stats.moyenneTachesParMois), Object.values(this.stats.moyenneTachesParMois));

    if (this.stats.collaborateursParTaille && Object.keys(this.stats.collaborateursParTaille).length > 0)
      this.createDoughnutChart('collaborateursParTailleChart', 'Répartition par Taille',
        Object.keys(this.stats.collaborateursParTaille), Object.values(this.stats.collaborateursParTaille));
  }

  // ═══════════════════════════════════════════════════════════════
  //  RECRUTEMENT
  // ═══════════════════════════════════════════════════════════════
  private initRecrutementCharts(): void {
    if (!this.stats) return;

    const colors = ['#0070AD','#F5A623','#66BB6A','#AB47BC','#29B6F6','#FF7043','#26A69A','#8D6E63','#78909C','#D4E157'];

    if (this.stats.candidaturesPerMonth && Object.keys(this.stats.candidaturesPerMonth).length > 0)
      this.createPieChart('candidaturesPerMonthChart', 'Candidatures par Mois',
        Object.keys(this.stats.candidaturesPerMonth), Object.values(this.stats.candidaturesPerMonth));

    if (this.stats.averageEntretiensPerMonth && Object.keys(this.stats.averageEntretiensPerMonth).length > 0)
      this.createMixedChart('averageEntretiensPerMonthChart',
        Object.keys(this.stats.averageEntretiensPerMonth), Object.values(this.stats.averageEntretiensPerMonth));

    if (this.stats.candidaturesByEtat && Object.keys(this.stats.candidaturesByEtat).length > 0)
      this.createPieChart('candidaturesByEtatChart', 'Répartition par état',
        Object.keys(this.stats.candidaturesByEtat), Object.values(this.stats.candidaturesByEtat));

    if (this.stats.candidaturesByDomaine && Object.keys(this.stats.candidaturesByDomaine).length > 0)
      this.createBarChart('candidaturesByDomaineChart', 'Candidatures par domaine',
        Object.keys(this.stats.candidaturesByDomaine), Object.values(this.stats.candidaturesByDomaine), colors);

    if (this.stats.candidaturesPerOffre && Object.keys(this.stats.candidaturesPerOffre).length > 0)
      this.createBarChart('candidaturesPerOffreChart', 'Candidatures par offre',
        Object.keys(this.stats.candidaturesPerOffre), Object.values(this.stats.candidaturesPerOffre), colors);

    if (this.stats.averageEntretiensPerOffre && Object.keys(this.stats.averageEntretiensPerOffre).length > 0)
      this.createLineChart('averageEntretiensPerOffreChart', 'Moyenne entretiens par offre',
        Object.keys(this.stats.averageEntretiensPerOffre), Object.values(this.stats.averageEntretiensPerOffre), '#F5A623');
  }

  // ═══════════════════════════════════════════════════════════════
  //  FACTORY GRAPHIQUES
  // ═══════════════════════════════════════════════════════════════
  private createBarChart(id: string, label: string, labels: string[], data: any[], colors: string[]): void {
    const canvas = this.getCanvas(id); if (!canvas) return;
    this.destroyChart(id);
    this.chartInstances[id] = new Chart(canvas.getContext('2d')!, {
      type: 'bar',
      data: { labels, datasets: [{ label, data, backgroundColor: colors, borderRadius: 5, borderWidth: 0 }] },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0A1628', titleColor: '#fff', bodyColor: '#E2E8F0', padding: 12, cornerRadius: 6 } },
        scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } }
      }
    });
  }

  private createLineChart(id: string, label: string, labels: string[], data: any[], color: string): void {
    const canvas = this.getCanvas(id); if (!canvas) return;
    this.destroyChart(id);
    this.chartInstances[id] = new Chart(canvas.getContext('2d')!, {
      type: 'line',
      data: { labels, datasets: [{ label, data, borderColor: color, backgroundColor: `${color}25`, borderWidth: 3, tension: 0.3, fill: true, pointBackgroundColor: color, pointRadius: 5, pointHoverRadius: 7 }] },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0A1628', titleColor: '#fff', bodyColor: '#E2E8F0', padding: 12, cornerRadius: 6 } },
        scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } }
      }
    });
  }

  private createMixedChart(id: string, labels: string[], values: any[]): void {
    const canvas = this.getCanvas(id); if (!canvas) return;
    this.destroyChart(id);
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.offsetHeight || 260);
    gradient.addColorStop(0, 'rgba(102,187,106,0.5)');
    gradient.addColorStop(1, 'rgba(102,187,106,0.04)');
    this.chartInstances[id] = new Chart(ctx, {
      data: {
        labels,
        datasets: [
          { type: 'bar',  label: 'Moyenne / mois', data: values, backgroundColor: 'rgba(0,112,173,0.7)', borderRadius: 5, order: 1 } as any,
          { type: 'line', label: 'Tendance',        data: values, borderColor: '#66BB6A', backgroundColor: gradient, fill: true, tension: 0.4, pointBackgroundColor: '#66BB6A', pointBorderColor: '#fff', borderWidth: 3, order: 0 } as any
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { position: 'top' }, tooltip: { mode: 'index', intersect: false } },
        scales: { y: { beginAtZero: true }, x: {} },
        animation: { duration: 1200, easing: 'easeOutQuart' }
      }
    });
  }

  private createHorizontalBarChart(id: string, label: string, labels: string[], data: any[]): void {
    const canvas = this.getCanvas(id); if (!canvas) return;
    this.destroyChart(id);
    this.chartInstances[id] = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets: [{ label, data, backgroundColor: '#0070AD', borderRadius: 4 }] },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0A1628', titleColor: '#fff', bodyColor: '#E2E8F0', padding: 12, cornerRadius: 6 } },
        scales: { x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } }, y: { grid: { display: false } } }
      }
    });
  }

  private createPieChart(id: string, label: string, labels: string[], data: any[]): void {
    const canvas = this.getCanvas(id); if (!canvas) return;
    this.destroyChart(id);
    this.chartInstances[id] = new Chart(canvas, {
      type: 'pie',
      data: { labels, datasets: [{ label, data, backgroundColor: ['#0070AD','#F5A623','#66BB6A','#AB47BC','#FF7043','#26A69A','#29B6F6','#8D6E63'], borderWidth: 2, borderColor: '#fff' }] },
      options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom', labels: { padding: 16 } } } }
    });
  }

  private createDoughnutChart(id: string, label: string, labels: string[], data: any[]): void {
    const canvas = this.getCanvas(id); if (!canvas) return;
    this.destroyChart(id);
    this.chartInstances[id] = new Chart(canvas, {
      type: 'doughnut',
      data: { labels, datasets: [{ label, data, backgroundColor: ['#0070AD','#66BB6A','#F5A623','#AB47BC','#FF7043','#26A69A','#29B6F6'], borderWidth: 2, borderColor: '#fff' }] },
      options: { responsive: true, maintainAspectRatio: true, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { padding: 16 } } } }
    });
  }
}
