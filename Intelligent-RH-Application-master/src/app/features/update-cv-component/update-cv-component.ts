import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScoutingService } from '../../services/scouting.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-update-cv',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './update-cv-component.html',
  styleUrls: ['./update-cv-component.scss']
})
export class UpdateCvComponent {

  prenom: string = '';
  nom: string = '';
  cvFile: File | null = null;
  responseMessage: string = '';
  loading: boolean = false;

  constructor(private talentService: ScoutingService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.cvFile = input.files[0];
    }
  }

  updateCV(): void {

    if (!this.prenom || !this.nom || !this.cvFile) {
      this.responseMessage = 'Veuillez remplir tous les champs et choisir un CV.';
      return;
    }

    this.loading = true;
    this.responseMessage = '';

    this.talentService.updateProfileCV(this.prenom, this.nom, this.cvFile)
      .subscribe({
        next: () => {
          this.responseMessage = 'CV mis à jour avec succès ! Score recalculé.';
          this.resetForm();
          this.loading = false;
        },
        error: (err) => {
          this.responseMessage =
            err?.error?.message ||
            err?.message ||
            'Erreur lors de la mise à jour du CV.';
          this.loading = false;
        }
      });
  }

  private resetForm(): void {
    this.prenom = '';
    this.nom = '';
    this.cvFile = null;
  }
}
