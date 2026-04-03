import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ElementRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Collaborateur } from '../../models/onboarding.model';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
interface IntegrationStep {
  label: string;
  description: string;
  completed: boolean;
  active: boolean;
  date?: string;
  status: string;
  badgeClass: string;
}

interface Metric {
  icon: string;
  label: string;
  value: string;
  color: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  trendClass?: string;
}

interface ProgressPhase {
  label: string;
  value: number;
  colorClass: string;
  badgeClass: string;
  statusLabel: string;
}

@Component({
  selector: 'app-rapport-onboarding',
  templateUrl: './rapport-onboarding-component.html',
  styleUrls: ['./rapport-onboarding-component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class RapportOnboardingComponent implements OnInit {


// Dans la classe :
  @ViewChild('rapportContent') rapportContent!: ElementRef;
  @Input() collaborateur: Collaborateur | null = null;
  @Input() signatureBase64: string = '';
  @Input() metierValue: string = '';
  @Output() close = new EventEmitter<void>();


  isExporting = false;

  // Données calculées
  reportDate: string = '';
  reportYear: string = '';
  integrationDate: string = '';
  progressPercentage: number = 0;
  avatarGradient: string = '';
  metierLabel: string = '';
  statusLabel: string = '';
  statusBadgeClass: string = '';
  statusTextClass: string = '';
  statusIcon: string = '';
  scoreDashArray: string = '';
  scoreDashOffset: string = '';

  integrationSteps: IntegrationStep[] = [];
  metrics: Metric[] = [];
  progressPhases: ProgressPhase[] = [];

  private readonly METIERS: Record<string, string> = {
    'DEVELOPPEMENT_WEB': 'Développement Web',
    'CLOUD': 'Cloud Computing',
    'DATA_SCIENCE': 'Data Science',
    'CYBERSECURITE': 'Cybersécurité',
    'MOBILE': 'Développement Mobile',
    'DEVOPS': 'DevOps & Infrastructure',
    'INTELLIGENCE_ARTIFICIELLE': 'IA & Machine Learning',
    'TEST_ET_QA': 'Test et Qualité Logicielle',
    'DESIGN_UX_UI': 'Design UX/UI'
  };

  private readonly AVATAR_COLORS = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
    'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    'linear-gradient(135deg, #ffecd2, #fcb69f)',
  ];

  ngOnInit(): void {
    this.initDates();
    this.initProgress();
    this.initAvatar();
    this.initMetier();
    this.initStatus();
    this.initScoreCircle();
    this.buildTimeline();
    this.buildMetrics();
    this.buildProgressPhases();
  }

  private initDates(): void {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
    this.reportDate = now.toLocaleDateString('fr-FR', options);
    this.reportYear = now.getFullYear().toString();

    // Date d'intégration depuis le collaborateur
    const dateProps = ['dateIntegration', 'date_creation', 'createdAt', 'dateCreation'];
    for (const prop of dateProps) {
      if (this.collaborateur && (this.collaborateur as any)[prop]) {
        const d = new Date((this.collaborateur as any)[prop]);
        if (!isNaN(d.getTime())) {
          this.integrationDate = d.toLocaleDateString('fr-FR', options);
          return;
        }
      }
    }
    this.integrationDate = this.reportDate;
  }

  private initProgress(): void {
    if (!this.collaborateur?.statutOnboarding) {
      this.progressPercentage = 10;
      return;
    }
    const status = String(this.collaborateur.statutOnboarding).toUpperCase().trim();
    if (['TERMINE', 'TERMINÉ', 'COMPLETE', 'COMPLÉTÉ'].includes(status)) {
      this.progressPercentage = 100;
    } else if (['EN_COURS', 'EN COURS', 'IN_PROGRESS'].includes(status)) {
      this.progressPercentage = 60;
    } else {
      this.progressPercentage = (this.collaborateur as any).progression ?? 10;
    }
  }

  private initAvatar(): void {
    const id = this.collaborateur?.id ?? 0;
    const index = (typeof id === 'number' ? id : parseInt(String(id), 10) || 0) % this.AVATAR_COLORS.length;
    this.avatarGradient = this.AVATAR_COLORS[index];
  }

  private initMetier(): void {
    this.metierLabel = this.METIERS[this.metierValue] ?? this.metierValue ?? 'Non défini';
  }

  private initStatus(): void {
    const pct = this.progressPercentage;
    if (pct === 100) {
      this.statusLabel = 'Intégration Terminée';
      this.statusBadgeClass = 'badge-success';
      this.statusTextClass = 'text-success';
      this.statusIcon = 'bi-check-circle-fill';
    } else if (pct >= 50) {
      this.statusLabel = 'En cours';
      this.statusBadgeClass = 'badge-warning';
      this.statusTextClass = 'text-warning';
      this.statusIcon = 'bi-clock-fill';
    } else {
      this.statusLabel = 'Démarrage';
      this.statusBadgeClass = 'badge-info';
      this.statusTextClass = 'text-info';
      this.statusIcon = 'bi-play-circle-fill';
    }
  }

  private initScoreCircle(): void {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const filled = (this.progressPercentage / 100) * circumference;
    this.scoreDashArray = `${circumference}`;
    this.scoreDashOffset = `${circumference - filled}`;
  }

  private buildTimeline(): void {
    const pct = this.progressPercentage;
    this.integrationSteps = [
      {
        label: 'Transfert Candidat',
        description: 'Le candidat a été transformé en collaborateur et ajouté au système.',
        completed: pct >= 25,
        active: pct < 25,
        date: this.integrationDate,
        status: pct >= 25 ? 'Complété' : 'En cours',
        badgeClass: pct >= 25 ? 'badge-done' : 'badge-active'
      },
      {
        label: 'Suivi d\'Intégration',
        description: 'Suivi de la progression des tâches administratives et de formation.',
        completed: pct >= 50,
        active: pct >= 25 && pct < 50,
        date: pct >= 50 ? this.reportDate : undefined,
        status: pct >= 50 ? 'Complété' : (pct >= 25 ? 'En cours' : 'En attente'),
        badgeClass: pct >= 50 ? 'badge-done' : (pct >= 25 ? 'badge-active' : 'badge-pending')
      },
      {
        label: 'Signature du Contrat',
        description: 'Signature électronique du contrat de travail et des documents officiels.',
        completed: pct >= 75,
        active: pct >= 50 && pct < 75,
        date: this.signatureBase64 ? this.reportDate : undefined,
        status: pct >= 75 ? 'Complété' : (pct >= 50 ? 'En cours' : 'En attente'),
        badgeClass: pct >= 75 ? 'badge-done' : (pct >= 50 ? 'badge-active' : 'badge-pending')
      },
      {
        label: 'Clôture & Validation',
        description: 'Finalisation complète de l\'intégration et activation du compte collaborateur.',
        completed: pct === 100,
        active: pct >= 75 && pct < 100,
        date: pct === 100 ? this.reportDate : undefined,
        status: pct === 100 ? 'Complété' : (pct >= 75 ? 'En cours' : 'En attente'),
        badgeClass: pct === 100 ? 'badge-done' : (pct >= 75 ? 'badge-active' : 'badge-pending')
      }
    ];
  }

  private buildMetrics(): void {
    const days = this.calculateDaysInProgress();
    const speed = days > 0 ? Math.round((this.progressPercentage / days) * 7) : 0;
    const score = Math.round((this.progressPercentage * 0.7 + speed * 3) / 10);

    this.metrics = [
      {
        icon: '📅',
        label: 'Jours en cours',
        value: `${days} j`,
        color: 'linear-gradient(135deg, #667eea22, #764ba222)',
        trend: 'up',
        trendValue: '+2 cette semaine',
        trendClass: 'trend-up'
      },
      {
        icon: '⚡',
        label: 'Vitesse / semaine',
        value: `${speed}%`,
        color: 'linear-gradient(135deg, #f093fb22, #f5576c22)',
        trend: speed > 10 ? 'up' : 'down',
        trendValue: speed > 10 ? 'Rapide' : 'Modéré',
        trendClass: speed > 10 ? 'trend-up' : 'trend-down'
      },
      {
        icon: '⭐',
        label: 'Score global',
        value: `${score}/10`,
        color: 'linear-gradient(135deg, #43e97b22, #38f9d722)',
        trend: score >= 7 ? 'up' : 'down',
        trendValue: score >= 7 ? 'Excellent' : 'À améliorer',
        trendClass: score >= 7 ? 'trend-up' : 'trend-down'
      },
      {
        icon: '🎯',
        label: 'Jours restants (est.)',
        value: this.progressPercentage === 100 ? '0 j' : `${this.calculateDaysLeft(days)}j`,
        color: 'linear-gradient(135deg, #fa709a22, #fee14022)',
      }
    ];
  }

  private buildProgressPhases(): void {
    const pct = this.progressPercentage;
    this.progressPhases = [
      {
        label: 'Documents & Paperasse',
        value: Math.min(100, pct >= 25 ? 100 : pct * 4),
        colorClass: 'color-blue',
        badgeClass: pct >= 25 ? 'badge-done' : 'badge-active',
        statusLabel: pct >= 25 ? '✓ Terminé' : '⏳ En cours'
      },
      {
        label: 'Formation initiale',
        value: Math.min(100, pct >= 50 ? 100 : Math.max(0, (pct - 25) * 4)),
        colorClass: 'color-purple',
        badgeClass: pct >= 50 ? 'badge-done' : (pct >= 25 ? 'badge-active' : 'badge-pending'),
        statusLabel: pct >= 50 ? '✓ Terminé' : (pct >= 25 ? '⏳ En cours' : '○ En attente')
      },
      {
        label: 'Équipement & Accès',
        value: Math.min(100, pct >= 75 ? 100 : Math.max(0, (pct - 50) * 4)),
        colorClass: 'color-cyan',
        badgeClass: pct >= 75 ? 'badge-done' : (pct >= 50 ? 'badge-active' : 'badge-pending'),
        statusLabel: pct >= 75 ? '✓ Terminé' : (pct >= 50 ? '⏳ En cours' : '○ En attente')
      },
      {
        label: 'Validation finale',
        value: pct === 100 ? 100 : Math.max(0, (pct - 75) * 4),
        colorClass: 'color-green',
        badgeClass: pct === 100 ? 'badge-done' : (pct >= 75 ? 'badge-active' : 'badge-pending'),
        statusLabel: pct === 100 ? '✓ Terminé' : (pct >= 75 ? '⏳ En cours' : '○ En attente')
      }
    ];
  }

  private calculateDaysInProgress(): number {
    if (!this.collaborateur) return 1;
    const props = ['dateIntegration', 'date_creation', 'createdAt', 'dateCreation'];
    for (const prop of props) {
      const val = (this.collaborateur as any)[prop];
      if (val) {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          const diff = Date.now() - d.getTime();
          return Math.max(1, Math.floor(diff / 86400000));
        }
      }
    }
    const id = typeof this.collaborateur.id === 'number' ? this.collaborateur.id : 1;
    return (id % 30) + 1;
  }

  private calculateDaysLeft(daysIn: number): number {
    if (this.progressPercentage === 0 || this.progressPercentage === 100) return 0;
    const total = (daysIn / this.progressPercentage) * 100;
    return Math.max(0, Math.round(total - daysIn));
  }

  getInitials(): string {
    const p = this.collaborateur?.prenom?.[0]?.toUpperCase() ?? '';
    const n = this.collaborateur?.nom?.[0]?.toUpperCase() ?? '';
    return p + n || '??';
  }


  exportPDF(): void {
    this.isExporting = true;

    const element = this.rapportContent.nativeElement;

    html2canvas(element, {
      scale: 2,           // haute résolution
      useCORS: true,
      backgroundColor: '#fafaf8',
      logging: false
    }).then(canvas => {

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth  = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const canvasWidth  = canvas.width;
      const canvasHeight = canvas.height;

      // Ratio pour tenir sur la largeur A4
      const ratio      = pageWidth / canvasWidth;
      const imgWidth   = pageWidth;
      const imgHeight  = canvasHeight * ratio;

      // Si le contenu dépasse une page → paginer
      let heightLeft   = imgHeight;
      let position     = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Nom du fichier dynamique
      const nom    = this.collaborateur?.nom    ?? 'collaborateur';
      const prenom = this.collaborateur?.prenom ?? '';
      const date   = new Date().toISOString().split('T')[0]; // 2026-03-14

      pdf.save(`rapport-onboarding-${prenom}-${nom}-${date}.pdf`);

      this.isExporting = false;

    }).catch(err => {
      console.error('Erreur export PDF :', err);
      this.isExporting = false;
    });
  }

  printReport(): void {
    window.print();
  }

  closeRapport(): void {
    this.close.emit();
  }
}
