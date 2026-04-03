import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RecrutementService } from '../../services/recrutement-service';

@Component({
  selector: 'app-offre-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './offre-create-component.html',
  styleUrls: ['./offre-create-component.css'] // Réutilise le style Cyber-Form
})
export class OffreCreateComponent {
  nouvelleOffre = {
    titre: '',
    description: ''
  };

  isSubmitting = false;
  message = '';

  constructor(private service: RecrutementService, private router: Router) {}

  submitOffre() {
    this.isSubmitting = true;
    this.service.creerOffre(this.nouvelleOffre).subscribe({
      next: (res) => {
        this.message = "🚀 Offre publiée avec succès !";
        setTimeout(() => this.router.navigate(['/offres']), 2000);
      },
      error: (err) => {
        this.message = "❌ Erreur lors de la création";
        this.isSubmitting = false;
      }
    });
  }
}
