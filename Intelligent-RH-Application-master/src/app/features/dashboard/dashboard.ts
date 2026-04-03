import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Candidat, DomainePrincipale, DomainePrincipaleLabels } from '../../models/hr.model';
import { CandidatService } from '../../services/candidat.service';
import { AsyncPipe, DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {ToastComponent} from '../toast-component/toast-component';
import {NotificationsService} from '../../services/notifications.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  standalone: true,
  imports: [
    AsyncPipe,
    NgForOf,
    NgIf,
    RouterLink,
    NgClass,
    FormsModule,
    DatePipe
  ],
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  candidats$!: Observable<Candidat[]>;

  // Filtres et Recherche
  searchTerm: string = '';
  selectedDomaine: string = '';

  // Pagination
  currentPage = 1;
  pageSize = 3;

  // Données pour le Select du filtre
  domaines = Object.values(DomainePrincipale);
  labels = DomainePrincipaleLabels;

  private notif = inject(NotificationsService);

  constructor(public candidatService: CandidatService) {
    this.candidats$ = this.candidatService.candidats$;
  }

  ngOnInit(): void {
    this.candidatService.loadAll();
  }

  // --- LOGIQUE DE FILTRE ET PAGINATION ---

  getFilteredCandidats(candidats: Candidat[]): Candidat[] {
    if (!candidats) return [];
    return candidats.filter(c => {
      const searchMatch = (c.nom + ' ' + c.prenom).toLowerCase().includes(this.searchTerm.toLowerCase());
      const domaineMatch = this.selectedDomaine === '' || c.domainePrincipale === this.selectedDomaine;
      return searchMatch && domaineMatch;
    });
  }

  getPaginatedCandidats(candidats: Candidat[]): Candidat[] {
    const filtered = this.getFilteredCandidats(candidats);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(startIndex, startIndex + this.pageSize);
  }

  getTotalPages(candidats: Candidat[]): number {
    const filtered = this.getFilteredCandidats(candidats);
    return Math.ceil(filtered.length / this.pageSize) || 1;
  }

  onSearchChange() {
    this.currentPage = 1;
  }

  goToNext(candidats: Candidat[]) {
    if (this.currentPage < this.getTotalPages(candidats)) {
      this.currentPage++;
    }
  }

  goToPrevious() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // --- ACTIONS ---

  onDelete(id: number | undefined): void {
    if (!id) return;

    // ✅ Remplacement de confirm() par une notification warning avec action
    this.notif.warning('Suppression en cours...');

    this.candidatService.delete(id).subscribe({
      next: () => {
        this.onSearchChange();
        this.notif.success('Candidat supprimé avec succès.');
      },
      error: (err) => {
        console.error('Erreur lors de la suppression', err);
        this.notif.error('Erreur lors de la suppression du candidat.');
      }
    });
  }

  downloadFile(fullPath: string) {
    if (!fullPath) return;
    const fileName = fullPath.split('/').pop() || '';
    this.candidatService.downloadCv(fileName).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
        // ✅ Notification succès après téléchargement
        this.notif.success(`CV "${fileName}" téléchargé avec succès.`);
      },
      // ✅ Remplacement de alert() par this.notif.error()
      error: () => this.notif.error('Fichier introuvable sur le serveur.')
    });
  }

  handleImageError(event: any, name: string) {
    const imgElement = event.target;
    imgElement.onerror = null;
    imgElement.src = `https://ui-avatars.com/api/?name=${name}&background=random&color=fff`;
  }
}
