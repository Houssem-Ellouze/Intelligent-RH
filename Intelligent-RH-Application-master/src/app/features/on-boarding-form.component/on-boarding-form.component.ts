import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnboardingService } from '../../services/onboarding.service';
import { NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-on-boarding-form',
  templateUrl: './on-boarding-form.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgForOf],
  styleUrls: ['./on-boarding-form.component.css']
})
export class OnBoardingFormComponent {
  // Optionnel : si tu reçois la liste des candidatures du parent
  @Input() candidatures: any[] = [];

  onBoardingForm: FormGroup;
  message: string = '';
  isSubmitting: boolean = false;

  metiers = [
    { value: 'DEVELOPPEMENT_WEB', label: 'Développement Web' },
    { value: 'CLOUD', label: 'Cloud Computing' },
    { value: 'DATA_SCIENCE', label: 'Data Science' },
    { value: 'CYBERSECURITE', label: 'Cybersécurité' },
    { value: 'MOBILE', label: 'Développement Mobile' },
    { value: 'DEVOPS', label: 'DevOps & Infrastructure' },
    { value: 'INTELLIGENCE_ARTIFICIELLE', label: 'IA & Machine Learning' },
    { value: 'TEST_ET_QA', label: 'Test et Qualité Logicielle' },
    { value: 'DESIGN_UX_UI', label: 'Design UX/UI' }
  ];

  constructor(private fb: FormBuilder, private onboardingService: OnboardingService) {
    this.onBoardingForm = this.fb.group({
      id: [null, [Validators.required]], // Contiendra l'objet candidature complet
      metier: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.onBoardingForm.valid) {
      // 1. On récupère l'objet sélectionné
      const selection = this.onBoardingForm.value.id;
      const metier = this.onBoardingForm.value.metier;

      // 2. Vérification de la structure (on évite le undefined)
      if (!selection || !selection.infos_candidat) {
        this.message = "Données du candidat incomplètes.";
        return;
      }

      // 3. Extraction des informations du candidat
      const idCandidat = selection.infos_candidat.id;
      const nom = selection.infos_candidat.nom || '';
      const prenom = selection.infos_candidat.prenom || '';

      if (!idCandidat) {
        this.message = "ID candidat manquant.";
        return;
      }

      if (!metier) {
        this.message = "Veuillez sélectionner un métier.";
        return;
      }

      this.isSubmitting = true;

      // 4. Appel avec les 4 arguments DANS LE BON ORDRE : id, metier, nom, prenom
      this.onboardingService.transformerCandidat(idCandidat, metier, nom, prenom).subscribe({
        next: (res) => {
          this.message = "Succès : Le candidat a été transféré.";
          this.isSubmitting = false;
          this.onBoardingForm.reset({id: null, metier: ''});

          // Optionnel: Réinitialiser le message après quelques secondes
          setTimeout(() => {
            this.message = '';
          }, 3000);
        },
        error: (err) => {
          console.error('Erreur détaillée:', err);

          // Message d'erreur plus spécifique
          if (err.status === 404) {
            this.message = "Erreur : Le candidat n'a pas été trouvé.";
          } else if (err.status === 400) {
            this.message = "Erreur : Données invalides.";
          } else {
            this.message = "Erreur lors du transfert. Veuillez réessayer.";
          }

          this.isSubmitting = false;

          // Optionnel: Réinitialiser le message d'erreur après quelques secondes
          setTimeout(() => {
            this.message = '';
          }, 5000);
        }
      });
    } else {
      this.message = "Veuillez remplir tous les champs obligatoires.";
    }
  }
}
