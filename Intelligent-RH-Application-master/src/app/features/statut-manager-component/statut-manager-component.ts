import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecrutementService } from '../../services/recrutement-service';

@Component({
  selector: 'app-statut-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statut-manager-component.html',
  styleUrls: ['./statut-manager-component.css']
})
export class StatutManagerComponent implements OnInit {
  @Input() candidatureId!: number;
  @Input() etatActuel!: string;
  @Output() statutChange = new EventEmitter<string>();

  tempEtat: string = '';
  noteRH: number = 3;
  commentaireRH: string = '';
  isProcessing = false;

  constructor(private service: RecrutementService) {}

  ngOnInit() {
    this.tempEtat = this.etatActuel;
  }

  onStatutChange() {
    // On ne lance plus changerStatut tout de suite,
    // l'utilisateur doit cliquer sur "Valider la décision"
  }

  confirmerChangement() {
    if (!this.candidatureId) return;
    this.isProcessing = true;

    // Envoi du statut + note + commentaire
    this.service.mettreAJourStatut(
      this.candidatureId,
      this.tempEtat,
      this.noteRH,
      this.commentaireRH
    ).subscribe({
      next: () => {
        this.isProcessing = false;
        this.etatActuel = this.tempEtat;
        this.statutChange.emit(this.etatActuel);
      },
      error: (err) => {
        this.isProcessing = false;
        console.error(err);
        alert("Erreur lors de la mise à jour du dossier.");
      }
    });
  }
}
