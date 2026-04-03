import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecrutementService } from '../../services/recrutement-service';

@Component({
  selector: 'app-entretien-planif',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entretien-planif-component.html',
  styleUrls: ['./entretien-planif-component.css']
})
export class EntretienPlanifComponent {
  @Input() candidatureId!: number;

  // Initialisation des variables manquantes
  isProcessing = false;
  errorOccurred = false;
  message = '';

  entretien = {
    dateEntretien: '',
    notes: ''
  };

  constructor(private service: RecrutementService) {}

  planifier() {
    if (!this.candidatureId) return;

    this.isProcessing = true; // Début du chargement (désactive le bouton)
    this.errorOccurred = false;

    this.service.planifierEntretien(this.candidatureId, this.entretien).subscribe({
      next: (res) => {
        this.message = "Rendez-vous confirmé avec succès !";
        this.isProcessing = false; // Fin du chargement
        this.errorOccurred = false;
        // Optionnel: réinitialiser le formulaire
        this.entretien = { dateEntretien: '', notes: '' };
      },
      error: (err) => {
        this.message = "Erreur lors de la communication avec le serveur.";
        this.isProcessing = false;
        this.errorOccurred = true; // Affiche le message en rouge
      }
    });
  }
}
