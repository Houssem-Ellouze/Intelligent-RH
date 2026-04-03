import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RecrutementService } from '../../services/recrutement-service';

@Component({
  selector: 'app-postulation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './postulation-component.html',
  styleUrl: './postulation-component.css'
})
export class PostulationComponent implements OnInit {
  offreId!: number;

  // Remplacement de candidatId par Nom/Prénom
  searchPrenom: string = '';
  searchNom: string = '';

  isSubmitting = false;
  messageSuccess = '';
  messageError = '';

  @Output() onSuccess = new EventEmitter<number>();

  constructor(
    private route: ActivatedRoute,
    private recrutementService: RecrutementService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.offreId = +params['offreId'];
    });
  }

  executePostulation() {
    this.isSubmitting = true;
    this.messageSuccess = '';
    this.messageError = '';

    // Appel au service avec les nouvelles coordonnées
    this.recrutementService.postuler(this.offreId, this.searchPrenom, this.searchNom).subscribe({
      next: (res) => {
        this.messageSuccess = `Votre candidature a été validée avec succès (Dossier #${res.id}).`;
        this.isSubmitting = false;

        // Notification au parent (Workflow Engine)
        if (res && res.id) {
          this.onSuccess.emit(res.id);
        }
      },
      error: (err) => {
        // Récupération du message d'erreur envoyé par le Backend (Microservice 2)
        this.messageError = err.error?.error || "Identité inconnue ou service indisponible.";
        this.isSubmitting = false;
      }
    });
  }
}
