import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { CandidatService } from '../../services/candidat.service';

@Component({
  selector: 'talent-stats',
  templateUrl: './talent-stats.html',
  styleUrls: ['./talent-stats.scss'],
  standalone: true
})
export class CandidatStatsComponent implements OnInit, AfterViewInit {

  stats: any = null;                 // Données API
  chartsInitialized = false;         // Pour éviter double init
  errorMessage: string | null = null; // Pour afficher les erreurs API

  constructor(private candidatService: CandidatService) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadStats();
  }

  ngAfterViewInit(): void {
    // Si stats sont déjà là, on initialise les charts
    if (this.stats && !this.chartsInitialized) {
      setTimeout(() => this.initCharts(), 0);
    }
  }

  loadStats(): void {
    this.candidatService.getDashboardStats().subscribe({
      next: (data) => {
        console.log("Dashboard Data reçues:", data); // 🔍 debug
        this.stats = data;
        this.errorMessage = null;

        // ⚡ Attendre que le DOM soit prêt
        setTimeout(() => this.initCharts(), 0);
      },
      error: (err) => {
        console.error("Erreur API :", err);
        this.errorMessage = "Impossible de charger les données du dashboard.";
      }
    });
  }

  initCharts(): void {
    if (!this.stats || this.chartsInitialized) return;

    // 1️⃣ Bar Chart : candidats par mois
    if (this.stats.candidatsParMois && Object.keys(this.stats.candidatsParMois).length > 0) {
      this.createHorizontalBarChart  (
        'candidatsParMoisChart',
        'Candidats par Mois',
        Object.keys(this.stats.candidatsParMois),
        Object.values(this.stats.candidatsParMois)
      );
    }

    // 2️⃣ Line Chart : moyenne compétences par mois
    if (this.stats.moyenneCompetencesParMois && Object.keys(this.stats.moyenneCompetencesParMois).length > 0) {
      this.createDoughnutChart(
        'moyenneCompetencesParMoisChart',
        'Moyenne des Compétences par Mois',
        Object.keys(this.stats.moyenneCompetencesParMois),
        Object.values(this.stats.moyenneCompetencesParMois)
      );
    }

    // 3️⃣ Pie Chart : répartition par expérience
    if (this.stats.candidatsParExperience && Object.keys(this.stats.candidatsParExperience).length > 0) {
      this.createPieChart(
        'candidatsParExperienceChart',
        'Répartition par Expérience',
        Object.keys(this.stats.candidatsParExperience),
        Object.values(this.stats.candidatsParExperience)
      );
    }

    this.chartsInitialized = true;
  }

  createBarChart(id: string, label: string, labels: string[], data: any[]): void {
    const ctx = document.getElementById(id) as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label, data, backgroundColor: '#6ff542' }] },
      options: { responsive: true }
    });
  }

  createPolarAreaChart(id: string, label: string, labels: string[], data: any[]): void {
    const ctx = document.getElementById(id) as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels,
        datasets: [{
          label,
          data,
          backgroundColor: ['#54f542', '#66BB6A', '#FFA726', '#AB47BC']
        }]
      },
      options: { responsive: true }
    });
  }
  createLineChart(id: string, label: string, labels: string[], data: any[]): void {
    const ctx = document.getElementById(id) as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{ label, data, borderColor: '#66BB6A', backgroundColor: '#66BB6A33', fill: true }] },
      options: { responsive: true }
    });
  }

  createHorizontalBarChart(id: string, label: string, labels: string[], data: any[]): void {
    const ctx = document.getElementById(id) as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label,
          data,
          backgroundColor: '#caa1d8'
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true
      }
    });
  }


  createPieChart(id: string, label: string, labels: string[], data: any[]): void {
    const ctx = document.getElementById(id) as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'pie',
      data: { labels, datasets: [{ label, data, backgroundColor: ['#FFA726', '#AB47BC', '#29B6F6', '#FF7043', '#26A69A'] }] },
      options: { responsive: true }
    });
  }
  createDoughnutChart(id: string, label: string, labels: string[], data: any[]): void {
    const ctx = document.getElementById(id) as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          label,
          data,
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#FF7043']
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

}
