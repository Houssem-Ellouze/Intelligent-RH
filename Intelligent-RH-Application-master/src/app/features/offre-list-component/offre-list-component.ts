import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OffreEmploi } from '../../models/offre-emploi.model';
import { RecrutementService } from '../../services/recrutement-service';

@Component({
  selector: 'app-offre-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offre-list-component.html',
  styleUrls: ['./offre-list-component.scss']
})
export class OffreListComponent implements OnInit {
  offres: OffreEmploi[] = [];
  loading = true;

  constructor(
    private recrutementService: RecrutementService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void { this.chargerOffres(); }

  chargerOffres() {
    this.loading = true;
    this.recrutementService.getOffresActives().subscribe({
      next: (data) => {
        this.offres = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  // Redirection vers le Dashboard avec filtre
  voirCandidatures(offreId: number) {
    this.router.navigate(['/dossiers'], { queryParams: { filterOffreId: offreId } });
  }

  onPostuler(offreId: number) {
    this.router.navigate(['/workflow-engine'], { queryParams: { offreId: offreId } });
  }

  naviguerVersCreation() {
    this.router.navigate(['/creer-offre']);
  }
  status() {
    this.router.navigate(['/status']);
  }
}
