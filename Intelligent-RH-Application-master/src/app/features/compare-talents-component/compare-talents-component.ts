import { Component, ChangeDetectorRef } from '@angular/core';
import { ScoutingService } from '../../services/scouting.service';
import { FormsModule } from '@angular/forms';
import { NgIf, DecimalPipe } from '@angular/common'; // Ajout de DecimalPipe pour arrondir les scores

@Component({
  selector: 'app-compare-talents',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    DecimalPipe
  ],
  templateUrl: './compare-talents-component.html',
  styleUrl: './compare-talents-component.scss'
})
export class CompareTalentsComponent {
  prenomA = ''; nomA = ''; prenomB = ''; nomB = '';
  result: any = null;
  winnerName = '';
  loading = false;
  errorMessage = '';

  constructor(private scoutingService: ScoutingService, private cdr: ChangeDetectorRef) {}

  compare() {
    if (!this.prenomA || !this.nomA || !this.prenomB || !this.nomB) return;

    this.loading = true;
    this.result = null; // Reset pour forcer le refresh
    this.errorMessage = '';

    this.scoutingService.compareTalents(this.prenomA, this.nomA, this.prenomB, this.nomB)
      .subscribe({
        next: (res) => {
          console.log("Données reçues pour affichage:", res);

          // Utilisation d'un mini-timeout pour forcer Angular à voir le changement
          setTimeout(() => {
            this.result = { ...res }; // On crée une nouvelle référence d'objet
            this.determineWinner();
            this.loading = false;
            this.cdr.markForCheck(); // Marque pour vérification
            this.cdr.detectChanges(); // Force le rendu immédiat
          }, 0);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = "Erreur de connexion au serveur.";
          this.cdr.detectChanges();
        }
      });
  }

  private determineWinner() {
    if (!this.result) return;
    const sA = Number(this.result.scoreA);
    const sB = Number(this.result.scoreB);

    if (sA > sB) this.winnerName = `${this.prenomA} ${this.nomA}`;
    else if (sB > sA) this.winnerName = `${this.prenomB} ${this.nomB}`;
    else this.winnerName = 'Égalité';
  }
}
