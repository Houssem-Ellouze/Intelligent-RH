import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { OnboardingService } from '../../services/onboarding.service';
import { Collaborateur } from '../../models/onboarding.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CandidatService } from '../../services/candidat.service';
import {Candidat} from '../../models/hr.model';

@Component({
  selector: 'app-onboarding-list',
  templateUrl: './onboarding-list.component.html',
  styleUrls: ['./onboarding-list.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class OnboardingListComponent implements OnInit, OnDestroy {
  collaborateurs: Collaborateur[] = [];
  candidat: Candidat[] = [];
  collaborateursOriginaux: Collaborateur[] = []; // Pour conserver la liste complète
  pageActuelle: number = 1;
  itemsParPage: number = 3;
  isFinalizing: boolean = false;
  loadingError: boolean = false;
  isLoading: boolean = true;
  searchTerm: string = '';
  filtreStatutActuel: string = 'TOUT';
  private subscriptions: Subscription = new Subscription();

  constructor(
    private onboardingService: OnboardingService,
    private cdr: ChangeDetectorRef,
    protected candidatService: CandidatService
  ) {}

  ngOnInit(): void {
    this.chargerCollaborateurs();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // --- Chargement collaborateurs ---
  chargerCollaborateurs(): void {
    this.isLoading = true;
    this.loadingError = false;

    const sub = this.onboardingService.getAllCollaborateurs().subscribe({
      next: (data) => {
        console.log('Données reçues:', data);

        // Tri par statut
        this.collaborateursOriginaux = data.sort((a, b) => {
          const order = { 'EN_COURS': 1, 'EN_ATTENTE': 2, 'TERMINE': 3 };
          const statusA = a.statutOnboarding?.toUpperCase() || 'EN_ATTENTE';
          const statusB = b.statutOnboarding?.toUpperCase() || 'EN_ATTENTE';
          return (order[statusA as keyof typeof order] || 2) - (order[statusB as keyof typeof order] || 2);
        });

        // Initialisation affichage
        this.appliquerFiltres();

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement:', err);
        this.loadingError = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

    this.subscriptions.add(sub);
  }

  // --- Filtres et recherche ---
  onSearch(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.appliquerFiltres();
  }

  filtrerParStatut(statut: string) {
    this.filtreStatutActuel = statut;
    this.appliquerFiltres();
  }

  appliquerFiltres() {
    let resultats = [...this.collaborateursOriginaux];

    // Filtre par recherche
    if (this.searchTerm) {
      resultats = resultats.filter(c =>
        c.nom.toLowerCase().includes(this.searchTerm) ||
        c.prenom.toLowerCase().includes(this.searchTerm) ||
        c.matricule.toLowerCase().includes(this.searchTerm)
      );
    }

    // Filtre par statut
    if (this.filtreStatutActuel !== 'TOUT') {
      resultats = resultats.filter(c => c.statutOnboarding === this.filtreStatutActuel);
    }

    this.collaborateurs = resultats;
    this.pageActuelle = 1;
  }

  // --- Pagination ---
  get collaborateursPagines() {
    const debut = (this.pageActuelle - 1) * this.itemsParPage;
    const fin = debut + this.itemsParPage;
    return this.collaborateurs.slice(debut, fin);
  }

  get totalPages(): number {
    return Math.ceil(this.collaborateurs.length / this.itemsParPage);
  }

  changerPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.pageActuelle) {
      this.pageActuelle = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPagesToDisplay(): number[] {
    const pages = [];
    const maxVisible = 5;

    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, this.pageActuelle - 2);
      let end = Math.min(this.totalPages, start + maxVisible - 1);
      if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  }

  trackByMatricule(index: number, collab: Collaborateur): string {
    return collab.matricule;
  }

  trackByPage(index: number, page: number): number {
    return page;
  }

  // --- Progression ---
  getProgressBarWidth(collab: Collaborateur): string {
    if (!collab.taches || collab.taches.length === 0) return '0%';
    const faites = collab.taches.filter(t => t.estRealisee).length;
    const percentage = Math.round((faites / collab.taches.length) * 100);
    return `${percentage}%`;
  }

  getProgressClass(statut: string): string {
    return statut === 'TERMINE' ? 'progress-fill termine' : 'progress-fill';
  }

  // --- Validation intégration ---
  cloturerDossier(id: number): void {
    if (this.isFinalizing) return;

    this.isFinalizing = true;
    const sub = this.onboardingService.finaliser(id).subscribe({
      next: () => {
        this.chargerCollaborateurs();
        this.isFinalizing = false;
        console.log('Intégration validée avec succès');
      },
      error: (err) => {
        console.error('Erreur lors de la validation:', err);
        this.isFinalizing = false;
        this.cdr.detectChanges();
      }
    });

    this.subscriptions.add(sub);
  }

  // --- Gestion des images ---
  handleImageError(event: Event, fullName: string) {
    const img = event.target as HTMLImageElement;

    // Récupérer les initiales du collaborateur
    const initials = fullName
      .split(' ')
      .map(n => n.charAt(0).toUpperCase())
      .join('');

    // Fallback SVG en base64 avec initiales
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <rect width="100" height="100" fill="#ccc"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="32" fill="#555">${initials}</text>
    </svg>
  `;

    img.src = `data:image/svg+xml;base64,${btoa(svg)}`;
  }



  getFileUrlOrDebug(collab: Collaborateur): string {
    if (collab.candidat?.fileName) {
      return this.candidatService.getFileUrl(collab.candidat.fileName);
    }
    return ''; // déclenche handleImageError
  }
}
