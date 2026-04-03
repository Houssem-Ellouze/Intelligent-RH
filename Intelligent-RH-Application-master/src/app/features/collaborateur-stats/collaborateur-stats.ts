import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import {OnboardingService} from '../../services/onboarding.service';

@Component({
  selector: 'app-collaborateur-stats',
  templateUrl: './collaborateur-stats.html',
  styleUrls: ['./collaborateur-stats.scss'],
  standalone: true
})
export class CollaborateurStatsComponent implements OnInit, AfterViewInit {

  stats: any = null;
  chartsInitialized = false;
  errorMessage: string | null = null;

  constructor(private collaborateurService: OnboardingService) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadStats();
  }

  ngAfterViewInit(): void {
    if (this.stats && !this.chartsInitialized) {
      setTimeout(() => this.initCharts(), 0);
    }
  }

  loadStats(): void {
    this.collaborateurService.getDashboardStats().subscribe({
      next: (data) => {
        console.log("Stats Collaborateurs :", data);
        this.stats = data;
        this.errorMessage = null;
        setTimeout(() => this.initCharts(), 0);
      },
      error: (err) => {
        console.error("Erreur API :", err);
        this.errorMessage = "Impossible de charger les statistiques des collaborateurs.";
      }
    });
  }

  initCharts(): void {
    if (!this.stats || this.chartsInitialized) return;

    // 1️⃣ Bar Chart : collaborateurs par mois
    if (this.stats.collaborateursParMois && Object.keys(this.stats.collaborateursParMois).length > 0) {
      this.createPieChart(
        'collaborateursParMoisChart',
        'Collaborateurs par Mois',
        Object.keys(this.stats.collaborateursParMois),
        Object.values(this.stats.collaborateursParMois)
      );
    }

    // 2️⃣ Line Chart : moyenne tâches par mois
    if (this.stats.moyenneTachesParMois && Object.keys(this.stats.moyenneTachesParMois).length > 0) {
      this.createHorizontalBarChart(
        'moyenneTachesParMoisChart',
        'Moyenne des Tâches par Mois',
        Object.keys(this.stats.moyenneTachesParMois),
        Object.values(this.stats.moyenneTachesParMois)
      );
    }

    // 3️⃣ Pie Chart : collaborateurs par taille de tâches
    if (this.stats.collaborateursParTaille && Object.keys(this.stats.collaborateursParTaille).length > 0) {
      this.createDoughnutChart(
        'collaborateursParTailleChart',
        'Répartition par Taille de Tâches',
        Object.keys(this.stats.collaborateursParTaille),
        Object.values(this.stats.collaborateursParTaille)
      );
    }

    this.chartsInitialized = true;
  }

  createBarChart(id: string, label: string, labels: string[], data: any[]): void {
    const ctx = document.getElementById(id) as HTMLCanvasElement;
    if (!ctx) return;
    new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label, data, backgroundColor: '#42A5F5' }] },
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

  createRadarChart(id: string, label: string, labels: string[], data: any[]): void {
    const ctx = document.getElementById(id) as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label,
          data,
          backgroundColor: 'rgba(66,165,245,0.3)',
          borderColor: '#42A5F5',
          pointBackgroundColor: '#42A5F5'
        }]
      },
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
          backgroundColor: '#26A69A'
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true
      }
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
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC']
        }]
      },
      options: { responsive: true }
    });
  }




  createSmoothLineChart(id: string, label: string, labels: string[], data: any[]): void {
    const ctx = document.getElementById(id) as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label,
          data,
          tension: 0.5,
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 8,
          borderColor: '#AB47BC',
          backgroundColor: 'rgba(171,71,188,0.2)',
          fill: true
        }]
      },
      options: { responsive: true }
    });
  }


}
