import { AfterViewInit, Component, ElementRef, inject, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgClass, DatePipe, DecimalPipe } from '@angular/common';
import { ScoutingService } from '../../services/scouting.service';
import {ToastComponent} from '../toast-component/toast-component';
import {NotificationsService} from '../../services/notifications.service';


interface ScoreData {
  prenom: string;
  nom: string;
  scoreGlobal: number;
  potentiel: string;
  trend?: number;
  analysisId?: string;
  details?: Array<{
    critère: string;
    valeur: number;
  }>;
}

@Component({
  selector: 'app-profile-score',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgClass,
    ToastComponent,
  ],
  templateUrl: './profile-score.html',
  styleUrls: ['./profile-score.scss']
})
export class ProfileScoreComponent implements AfterViewInit, OnInit {
  @ViewChild('resultCard') resultCard!: ElementRef;

  // Données du formulaire
  prenom: string = '';
  nom: string = '';

  // État de l'interface
  loading: boolean = false;

  // Données de résultat
  scoreData: ScoreData | null = null;

  // Dates et timestamps
  currentDate: Date = new Date();
  currentTime: Date = new Date();

  // Référence à Math pour le template
  Math = Math;

  private notif = inject(NotificationsService);

  constructor(private scoutingService: ScoutingService) {
    this.updateDateTime();
  }

  ngOnInit() {
    setInterval(() => this.updateDateTime(), 1000);
  }

  ngAfterViewInit() {
    setTimeout(() => this.createParticles(), 100);
  }

  private updateDateTime(): void {
    this.currentDate = new Date();
    this.currentTime = new Date();
  }

  private createParticles(): void {
    const container = this.resultCard?.nativeElement;
    if (!container) return;

    const oldParticles = container.querySelectorAll('.particle');
    oldParticles.forEach((p: HTMLElement) => p.remove());

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';

      const rect = container.getBoundingClientRect();
      particle.style.left = Math.random() * rect.width + 'px';
      particle.style.top = Math.random() * rect.height + 'px';

      const duration = 3 + Math.random() * 5;
      const delay = Math.random() * 2;
      particle.style.animation = `particleFloat ${duration}s linear infinite`;
      particle.style.animationDelay = delay + 's';

      const hue = this.scoreData ?
        180 + (this.scoreData.scoreGlobal / 100) * 60 :
        180 + Math.random() * 60;
      particle.style.background = `hsl(${hue}, 100%, 50%)`;

      const size = 2 + Math.random() * 4;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';

      container.appendChild(particle);
    }
  }

  loadScore(): void {
    if (!this.validateInputs()) return;

    this.loading = true;
    this.scoreData = null;

    this.scoutingService.getProfileScore(this.prenom, this.nom).subscribe({
      next: (data: ScoreData) => {
        this.scoreData = {
          ...data,
          trend: data.trend || Math.random() * 10 - 5,
          analysisId: 'SC' + Math.floor(1000 + Math.random() * 9000)
        };
        this.loading = false;
        // ✅ Notification succès après chargement
        this.notif.success(`Profil de ${this.prenom} ${this.nom} chargé avec succès.`);
        setTimeout(() => this.createParticles(), 100);
      },
      error: (err) => {
        console.error('Erreur de chargement:', err);
        this.loading = false;
        // ✅ Notification erreur à la place de hasError/errorMessage
        this.notif.error('Aucun profil trouvé pour ce nom.');
      }
    });
  }

  private validateInputs(): boolean {
    if (!this.prenom?.trim() || !this.nom?.trim()) {
      // ✅ Notification warning pour validation
      this.notif.warning('Veuillez saisir le prénom et le nom.');
      return false;
    }

    this.prenom = this.prenom.trim();
    this.nom = this.nom.trim();
    return true;
  }

  resetForm(): void {
    this.prenom = '';
    this.nom = '';
    this.scoreData = null;
  }

  getPerformanceClass(potentiel: string): string {
    const performanceMap: { [key: string]: string } = {
      'Exceptionnel': 'performance-exceptional',
      'Élevé': 'performance-high',
      'Bon': 'performance-good',
      'Moyen': 'performance-medium'
    };
    return performanceMap[potentiel] || 'performance-default';
  }
}
