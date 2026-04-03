import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Collaborateur} from '../../models/onboarding.model';
import {Candidature} from '../../models/candidature.model';
import {OnboardingService} from '../../services/onboarding.service';
import {RecrutementService} from '../../services/recrutement-service';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import * as QRCode from 'qrcode';
import {SignatureQrComponent} from '../signature-qr-component/signature-qr-component';
import {RapportOnboardingComponent} from '../rapport-onboarding-component/rapport-onboarding-component';
import {ToastComponent} from '../toast-component/toast-component';
import {NotificationsService} from '../../services/notifications.service';


// Interface pour les statistiques pré-calculées
interface CollaborateurStats {
  id: number;
  progressPercentage: number;
  daysInProgress: number;
  startDate: string;
  daysLeft: number;
  speed: number;
  score: number;
  priorityClass: string;
  priorityLabel: string;
  avatarColor: string;
  statusClass: string;
  isHighlighted: boolean;
  collaborateur: Collaborateur; // Référence au collaborateur original
}

@Component({
  selector: 'master-onboarding',
  templateUrl: './master-onboarding.component.html',
  styleUrls: ['./master-onboarding.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ReactiveFormsModule, SignatureQrComponent, RapportOnboardingComponent]
})
export class MasterOnboardingComponent implements OnInit, AfterViewInit {
  currentStep = 1;
  onBoardingForm: FormGroup;
  allCollaborateurs: Collaborateur[] = [];
  filteredCollaborateurs: Collaborateur[] = [];
  collaborateurStatsList: CollaborateurStats[] = [];
  candidatures: Candidature[] = [];
  isSubmitting = false;
  private ctx!: CanvasRenderingContext2D;
  signatureBase64 = '';
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('rapportContent') rapportContent!: ElementRef;

  showRapport = false;
  currentCollaborateur: Collaborateur | null = null;

  // ✅ Injection du service de notification
  private notif = inject(NotificationsService);

  generateReport(): void {
    const dernierCollab = this.allCollaborateurs[this.allCollaborateurs.length - 1] ?? null;
    this.currentCollaborateur = dernierCollab;
    this.showRapport = true;
  }

  metiers = [
    { value: 'DEVELOPPEMENT_WEB', label: 'Développement Web' },
    { value: 'CLOUD', label: 'Cloud Computing' },
    { value: 'DATA_SCIENCE', label: 'Data Science' },
    { value: 'CYBERSECURITE', label: 'Cybersécurité' },
    { value: 'MOBILE', label: 'Développement Mobile' },
    { value: 'DEVOPS', label: 'DevOps & Infrastructure' },
    { value: 'INTELLIGENCE_ARTIFICIELLE', label: 'IA & Machine Learning' },
    { value: 'TEST_ET_QA', label: 'Test et Qualité Logicielle' },
    { value: 'DESIGN_UX_UI', label: 'Design UX/UI' }
  ];

  private statsCache = new Map<number, CollaborateurStats>();

  constructor(
    private fb: FormBuilder,
    private onboardingService: OnboardingService,
    private recrutementService: RecrutementService,
    private service: OnboardingService,
    private cdr: ChangeDetectorRef
  ) {
    this.onBoardingForm = this.fb.group({
      id: [null, [Validators.required]],
      metier: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.filteredCandidatures = [...this.candidatures];
    this.filteredMetiers = [...this.metiers];
    this.loadData();
    if (!this.canvas) return;
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';

    let drawing = false;
    const canvasEl = this.canvas.nativeElement;

    canvasEl.addEventListener('mousedown', () => drawing = true);
    canvasEl.addEventListener('mouseup', () => {
      drawing = false;
      this.ctx.beginPath();
    });
    canvasEl.addEventListener('mousemove', (e: MouseEvent) => {
      if (!drawing) return;
      const rect = canvasEl.getBoundingClientRect();
      this.ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    });
  }


  canFinalize(collab: Collaborateur): boolean {
    if (!collab.statutOnboarding) return true;

    const status = String(collab.statutOnboarding).toUpperCase().trim();

    if (status === 'TERMINE' || status === 'TERMINÉ' || status === 'COMPLETE') {
      return false;
    }

    return true;
  }

  loadData(): void {
    // 1. Chargement des candidatures (Recrutement Service)
    this.recrutementService.getAllCandidatures().subscribe({
      next: (data) => {
        this.candidatures = data;
        // Très important pour votre dropdown de sélection dans le template
        this.filteredCandidatures = [...this.candidatures];
        console.log('Candidatures chargées:', this.candidatures.length);
      },
      error: (err) => {
        console.error('Erreur 403 sur recrutement-service:', err);
        // Utilisation de votre service de notification injecté
        this.notif.error("Accès refusé : Vérifiez vos permissions RH pour les candidatures.");
      }
    });

    // 2. Chargement des collaborateurs (Onboarding Service)
    this.onboardingService.getAllCollaborateurs().subscribe({
      next: (data) => {
        this.allCollaborateurs = data;
        // Mise à jour de la vue et calcul des statistiques
        this.updateFilteredLists();
        this.calculateAllStats();
        console.log('Collaborateurs chargés:', this.allCollaborateurs.length);
      },
      error: (err) => {
        console.error('Erreur onboarding-service:', err);
        this.notif.error("Impossible de charger la liste des collaborateurs.");
      }
    });
  }

  getIntegrationTime(): string {
    return '7 jours';
  }

  scheduleFollowUp(): void {
    console.log('Planification du suivi');
  }

  onTransformSubmit(): void {
    const selection = this.onBoardingForm.get('id')?.value;
    const metier = this.onBoardingForm.get('metier')?.value;

    // ✅ Remplacement de alert() par this.notif.warning()
    if (!selection || !selection.infos_candidat) {
      this.notif.warning('Veuillez sélectionner un candidat valide.');
      return;
    }

    const idCandidat = selection.infos_candidat.id;
    const nom = selection.infos_candidat.nom;
    const prenom = selection.infos_candidat.prenom;

    // ✅ Remplacement de alert() par this.notif.error()
    if (!idCandidat) {
      this.notif.error('ID candidat manquant.');
      return;
    }

    this.isSubmitting = true;

    this.onboardingService.transformerCandidat(idCandidat, metier, nom, prenom).subscribe({
      next: (response) => {
        console.log('✅ Réponse serveur:', response);

        this.onboardingService.getAllCollaborateurs().subscribe(data => {
          this.allCollaborateurs = data;
          this.isSubmitting = false;
          this.onBoardingForm.reset();
          this.currentStep = 2;
          this.updateFilteredLists();
          this.calculateAllStats();
          // ✅ Notification de succès après transformation
          this.notif.success('Candidat transformé en collaborateur avec succès.');
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('❌ Erreur:', err);
        // ✅ Remplacement de alert() par this.notif.error()
        this.notif.error('Erreur lors de la transformation. Vérifiez la console.');
      }
    });
  }

  updateFilteredLists(): void {
    const statusCible = this.currentStep === 2 ? 'EN_COURS' : 'TERMINE';
    this.filteredCollaborateurs = this.allCollaborateurs.filter(c =>
      c.statutOnboarding && String(c.statutOnboarding).toUpperCase() === statusCible
    );
  }

  calculateAllStats(): void {
    this.statsCache.clear();
    this.collaborateurStatsList = this.filteredCollaborateurs.map(collab => {
      return this.getOrCreateStats(collab);
    });
  }

  showCandidateDropdown = false;
  showMetierDropdown = false;

  filteredCandidatures: any[] = [];
  filteredMetiers: any[] = [];

  getMetierDemandLevel(metierValue: string): number {
    const levels: any = {
      'developpeur': 95,
      'designer': 75,
      'marketing': 85,
      'commercial': 70,
      'rh': 60,
      'direction': 90
    };
    return levels[metierValue] || 50;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-wrapper')) {
      this.showCandidateDropdown = false;
      this.showMetierDropdown = false;
    }
  }

  private getOrCreateStats(collab: Collaborateur): CollaborateurStats {
    if (collab.id && this.statsCache.has(collab.id)) {
      return this.statsCache.get(collab.id)!;
    }

    const progressPercentage = this.getProgressPercentage(collab);
    const daysInProgress = this.calculateDaysInProgress(collab);
    const speed = this.calculateSpeed(progressPercentage, daysInProgress);

    // @ts-ignore
    const stats: CollaborateurStats = {
      progressPercentage: progressPercentage,
      daysInProgress: daysInProgress,
      startDate: this.formatStartDate(collab),
      daysLeft: this.calculateDaysLeft(progressPercentage, daysInProgress),
      speed: speed,
      score: this.calculateScore(progressPercentage, speed),
      priorityClass: this.getPriorityClassFromProgress(progressPercentage, daysInProgress),
      priorityLabel: this.getPriorityLabelFromClass(this.getPriorityClassFromProgress(progressPercentage, daysInProgress)),
      avatarColor: this.getAvatarColor(collab),
      statusClass: this.getStatusClassFromProgress(progressPercentage),
      isHighlighted: progressPercentage === 100,
      collaborateur: collab
    };

    if (collab.id) {
      this.statsCache.set(collab.id, stats);
    }
    return stats;
  }

  private calculateDaysInProgress(collab: Collaborateur): number {
    let startDate: Date | null = null;

    const possibleDateProps = ['dateIntegration', 'date_creation', 'createdAt', 'dateCreation', 'date_debut'];

    for (const prop of possibleDateProps) {
      if ((collab as any)[prop]) {
        try {
          startDate = new Date((collab as any)[prop]);
          if (!isNaN(startDate.getTime())) {
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }

    if (startDate && !isNaN(startDate.getTime())) {
      const today = new Date();
      const diff = today.getTime() - startDate.getTime();
      return Math.max(1, Math.floor(diff / (1000 * 3600 * 24)));
    }

    // @ts-ignore
    const stableDays = (collab.id % 30) + 1;
    return stableDays;
  }

  private calculateDaysLeft(progress: number, daysInProgress: number): number {
    if (progress === 0) return 30;
    if (progress >= 100) return 0;
    const totalEstimate = (daysInProgress / progress) * 100;
    return Math.max(0, Math.round(totalEstimate - daysInProgress));
  }

  private calculateSpeed(progress: number, daysInProgress: number): number {
    if (daysInProgress === 0) return 0;
    return Math.round((progress / daysInProgress) * 7);
  }

  private calculateScore(progress: number, speed: number): number {
    return Math.round((progress * 0.7 + speed * 3) / 10);
  }

  private formatStartDate(collab: Collaborateur): string {
    const possibleDateProps = ['dateIntegration', 'date_creation', 'createdAt', 'dateCreation', 'date_debut'];

    for (const prop of possibleDateProps) {
      if ((collab as any)[prop]) {
        try {
          const date = new Date((collab as any)[prop]);
          if (!isNaN(date.getTime())) {
            const day = date.getDate();
            const month = date.toLocaleString('fr-FR', { month: 'short' });
            return `${day} ${month}`;
          }
        } catch (e) {
          continue;
        }
      }
    }

    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    // @ts-ignore
    const day = (collab.id % 28) + 1;
    // @ts-ignore
    const monthIndex = collab.id % 12;
    return `${day} ${months[monthIndex]}`;
  }

  private getPriorityClassFromProgress(progress: number, days: number): string {
    if (progress < 30 && days > 7) return 'high';
    if (progress < 60 && days > 14) return 'medium';
    return 'low';
  }

  private getPriorityLabelFromClass(priorityClass: string): string {
    switch (priorityClass) {
      case 'high': return 'Prioritaire';
      case 'medium': return 'Moyen';
      default: return 'Normal';
    }
  }

  private getAvatarColor(collab: Collaborateur): string {
    const colors = [
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #43e97b, #38f9d7)',
      'linear-gradient(135deg, #fa709a, #fee140)'
    ];
    const index = (collab.id?.toString().charCodeAt(0) || 0) % colors.length;
    return colors[index];
  }

  private getStatusClassFromProgress(progress: number): string {
    if (progress === 100) return 'active';
    if (progress >= 50) return 'warning';
    return 'inactive';
  }

  getStatusText(collab: Collaborateur): string {
    if (!collab.statutOnboarding) return 'En cours';

    const status = String(collab.statutOnboarding).toUpperCase().trim();

    if (status === 'TERMINE' || status === 'TERMINÉ' || status === 'COMPLETE') {
      return 'Terminé';
    }

    return 'En cours';
  }

  finaliser(id: number | undefined): void {
    if (!id) return;
    this.isSubmitting = true;
    this.onboardingService.finaliser(id).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.currentStep = 3;
        this.loadData();
        // ✅ Notification de succès après finalisation
        this.notif.success('Onboarding finalisé avec succès.');
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        // ✅ Notification d'erreur après échec de finalisation
        this.notif.error('Erreur lors de la finalisation. Veuillez réessayer.');
      }
    });
  }

  private getProgressPercentage(collab: Collaborateur): number {
    if (!collab.statutOnboarding) return 10;

    const status = String(collab.statutOnboarding).toUpperCase().trim();

    console.log(`Debug: ID ${collab.id}, Statut original: "${collab.statutOnboarding}", Statut normalisé: "${status}"`);

    if (status === 'TERMINE' || status === 'TERMINÉ' || status === 'TERMINEE' || status === 'TERMINÉE' || status === 'COMPLETE' || status === 'COMPLÉTÉ') {
      return 100;
    }

    if (status === 'EN_COURS' || status === 'EN COURS' || status === 'IN_PROGRESS' || status === 'IN PROGRESS') {
      return 60;
    }

    if (status === 'NOUVEAU' || status === 'NEW' || status === 'CREATED') {
      return 10;
    }

    if ((collab as any).progression) {
      const progression = parseInt((collab as any).progression);
      if (!isNaN(progression)) {
        return Math.min(100, Math.max(0, progression));
      }
    }

    return 10;
  }

  getCompletedCount(): number {
    return this.collaborateurStatsList.filter(s => s.progressPercentage === 100).length;
  }

  getInProgressCount(): number {
    return this.collaborateurStatsList.filter(s => s.progressPercentage < 100).length;
  }

  getAvgProgress(): number {
    if (this.collaborateurStatsList.length === 0) return 0;
    const total = this.collaborateurStatsList.reduce((sum, s) => sum + s.progressPercentage, 0);
    return Math.round(total / this.collaborateurStatsList.length);
  }

  getFastestProgress(): number {
    if (this.collaborateurStatsList.length === 0) return 0;
    return Math.max(...this.collaborateurStatsList.map(s => s.progressPercentage));
  }

  sendReminder(id: number): void {
    console.log('Rappel envoyé pour', id);
    // ✅ Notification info pour rappel envoyé
    this.notif.info(`Rappel envoyé pour le collaborateur #${id}.`);
  }

  viewDetails(id: number): void {
    console.log('Voir détails pour', id);
  }

  azert() {
    this.currentStep = 4;
  }

  goToStep(step: number): void {
    this.currentStep = step;
    this.updateFilteredLists();
    this.calculateAllStats();

    if (step === 3) {
      setTimeout(() => this.ngOnInit(), 0);
    }
  }

  onSignatureSaved(signature: string) {
    this.signatureBase64 = signature;
    console.log('Signature reçue du composant enfant:', signature);

    localStorage.setItem('employeeSignature', JSON.stringify(signature));

    this.updateIntegrationStatus('signature_completed');
    // ✅ Notification de succès pour signature
    this.notif.success('Signature enregistrée avec succès.');
  }

  onQRGenerated(qrData: any) {
    console.log('QR Code généré:', qrData);
  }

  updateIntegrationStatus(status: string) {
    // Votre logique de mise à jour
  }

  ngAfterViewInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';

    let drawing = false;
    const canvas = this.canvas.nativeElement;

    canvas.addEventListener('mousedown', () => drawing = true);
    canvas.addEventListener('mouseup', () => {
      drawing = false;
      this.ctx.beginPath();
    });

    canvas.addEventListener('mousemove', (e: MouseEvent) => {
      if (!drawing) return;
      const rect = canvas.getBoundingClientRect();
      this.ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    });
  }
}
