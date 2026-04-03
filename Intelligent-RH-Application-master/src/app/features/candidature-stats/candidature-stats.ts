import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { RecrutementService } from '../../services/recrutement-service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-candidature-stats',
  templateUrl: './candidature-stats.html',
  standalone: true,
  imports: [

  ],
  styleUrls: ['./candidature-stats.scss']
})
export class CandidatureStatsComponent implements OnInit {

  stats: any = null;
  errorMessage: string | null = null;
  chartsInitialized = false;

  constructor(private statsService: RecrutementService) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.statsService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        setTimeout(() => this.initCharts(), 0);
      },
      error: (err) => {
        console.error("Erreur API :", err);
        this.errorMessage = "Impossible de charger les statistiques.";
      }
    });
  }

  initCharts(): void {
    if (!this.stats || this.chartsInitialized) return;

    // Couleurs dynamiques
    const colors = ['#42A5F5','#66BB6A','#FFA726','#AB47BC','#29B6F6','#FF7043','#26A69A','#8D6E63','#78909C','#D4E157'];

    // Bar Chart : candidatures par mois
    if (this.stats.candidaturesPerMonth) {
      this.createPieChart(
        'candidaturesPerMonthChart',
        'Candidatures par Mois',
        Object.keys(this.stats.candidaturesPerMonth),
        Object.values(this.stats.candidaturesPerMonth),
        colors
      );
    }

    // Line Chart : moyenne d'entretiens par mois

    if (this.stats.averageEntretiensPerMonth) {
      const ctx = document.getElementById('averageEntretiensPerMonthChart') as HTMLCanvasElement;
      if (ctx) {
        const labels = Object.keys(this.stats.averageEntretiensPerMonth);
        const values = Object.values(this.stats.averageEntretiensPerMonth);

        // Création d'un gradient pour la ligne
        const gradient = ctx.getContext('2d')!.createLinearGradient(0, 0, 0, ctx.height);
        gradient.addColorStop(0, 'rgba(102, 187, 106, 0.6)'); // haut
        gradient.addColorStop(1, 'rgba(102, 187, 106, 0.1)'); // bas

        new Chart(ctx, {
          data: {
            labels: labels,
            datasets: [
              {
                type: 'bar',                 // Bar pour la valeur
                label: 'Moyenne par mois',
                data: values,
                backgroundColor: 'rgb(183,151,250)',
                borderColor: '#42A5F5',
                borderWidth: 1,
                borderRadius: 5,             // arrondi des barres
                order: 1
              },
              {
                type: 'line',                // Line pour la tendance
                label: 'Tendance',
                data: values,
                borderColor: '#66BB6A',
                backgroundColor: gradient,   // remplissage dégradé
                fill: true,
                tension: 0.4,                // courbe lissée
                pointBackgroundColor: '#66BB6A',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#66BB6A',
                borderWidth: 3,
                order: 0                     // line derrière les bars
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'top' },
              title: {
                display: true,
                text: 'Moyenne des entretiens par mois'
              },
              tooltip: { mode: 'index', intersect: false }
            },
            interaction: {
              mode: 'nearest',
              intersect: false
            },
            scales: {
              y: {
                beginAtZero: true,
                title: { display: true, text: 'Moyenne' }
              },
              x: {
                title: { display: true, text: 'Mois' }
              }
            },
            animation: {
              duration: 1500,
              easing: 'easeOutQuart'
            }
          }
        });
      }
    }


    // Pie Chart : candidatures par état
    if (this.stats.candidaturesByEtat) {
      this.createPieChart(
        'candidaturesByEtatChart',
        'Répartition par état',
        Object.keys(this.stats.candidaturesByEtat),
        Object.values(this.stats.candidaturesByEtat),
        colors
      );
    }

    // Bar Chart : candidatures par domaine
    if (this.stats.candidaturesByDomaine) {
      this.createBarChart(
        'candidaturesByDomaineChart',
        'Candidatures par domaine',
        Object.keys(this.stats.candidaturesByDomaine),
        Object.values(this.stats.candidaturesByDomaine),
        colors
      );
    }

    // Bar Chart : candidatures par offre
    if (this.stats.candidaturesPerOffre) {
      this.createBarChart(
        'candidaturesPerOffreChart',
        'Candidatures par offre',
        Object.keys(this.stats.candidaturesPerOffre),
        Object.values(this.stats.candidaturesPerOffre),
        colors
      );
    }

    // Line Chart : moyenne entretiens par offre
    if (this.stats.averageEntretiensPerOffre) {
      this.createLineChart(
        'averageEntretiensPerOffreChart',
        'Moyenne des entretiens par offre',
        Object.keys(this.stats.averageEntretiensPerOffre),
        Object.values(this.stats.averageEntretiensPerOffre),
        '#FFA726'
      );
    }

    this.chartsInitialized = true;
  }

  createBarChart(id: string, label: string, labels: string[], data: any[], colors: string[]): void {
    const ctx = document.getElementById(id) as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label, data, backgroundColor: colors }] },
      options: { responsive: true }
    });
  }

  createLineChart(id: string, label: string, labels: string[], data: any[], color: string): void {
    const ctx = document.getElementById(id) as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{ label, data, borderColor: color, backgroundColor: color + '33', fill: true }] },
      options: { responsive: true }
    });
  }

  createPieChart(id: string, label: string, labels: string[], data: any[], colors: string[]): void {
    const ctx = document.getElementById(id) as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'pie',
      data: { labels, datasets: [{ label, data, backgroundColor: colors }] },
      options: { responsive: true }
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
          backgroundColor: 'rgba(245,215,66,0.3)',
          borderColor: '#f5f242',
          pointBackgroundColor: '#def604'
        }]
      },
      options: { responsive: true }
    });
  }

}
