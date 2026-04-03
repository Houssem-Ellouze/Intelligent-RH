import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RecrutementService } from '../../services/recrutement-service';
import { DossierComplet } from '../../models/dossier-complet.model';
import { StatutManagerComponent } from '../statut-manager-component/statut-manager-component';
import { EntretienPlanifComponent } from '../entretien-planif-component/entretien-planif-component';

@Component({
  selector: 'app-dossier-list',
  standalone: true,
  imports: [CommonModule, StatutManagerComponent],
  templateUrl: './dossier-list-component.html',
  styleUrls: ['./dossier-list-component.css']
})
export class DossierListComponent implements OnInit {
  dossiers: DossierComplet[] = [];
  dossiersAffiches: DossierComplet[] = [];
  loading = true;
  filtreActif = false;

  // Pagination
  currentPage: number = 0; // On passe à un index 0 pour faciliter les calculs
  itemsPerPage: number = 3;

  constructor(
    private recrutementService: RecrutementService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chargerEtFiltrer();
  }

  // Utilisé par le HTML pour le total
  get totalElements(): number {
    return this.dossiersAffiches.length;
  }

  // GETTER : Retourne uniquement les dossiers de la page actuelle
  get paginatedDossiers(): DossierComplet[] {
    const startIndex = this.currentPage * this.itemsPerPage;
    return this.dossiersAffiches.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // GETTER : Calcul du nombre total de pages
  get totalPages(): number {
    return Math.ceil(this.dossiersAffiches.length / this.itemsPerPage);
  }

  // Génère le tableau de numéros pour le *ngFor
  getPageArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  chargerEtFiltrer() {
    this.loading = true;
    this.recrutementService.getDossiersComplets().subscribe({
      next: (allDossiers) => {
        this.dossiers = allDossiers;

        this.route.queryParams.subscribe(params => {
          const idOffre = params['filterOffreId'];
          if (idOffre) {
            this.filtreActif = true;
            this.dossiersAffiches = this.dossiers.filter(d =>
              d.offre_concernee.includes(idOffre) || d.candidature_id.toString() === idOffre
            );
          } else {
            this.filtreActif = false;
            this.dossiersAffiches = [...this.dossiers];
          }
          this.currentPage = 0; // Reset à la première page
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
    }
  }

  resetFiltre() {
    this.router.navigate(['/dossiers']);
  }

  // Utilisé par l'output (statutChange)
  chargerDossiers(): void {
    this.chargerEtFiltrer();
  }
}
