import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CandidatService } from '../../services/candidat.service';
import { DomainePrincipale, DomainePrincipaleLabels } from '../../models/hr.model';


import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import {ToastComponent} from '../toast-component/toast-component';
import {NotificationsService} from '../../services/notifications.service';

@Component({
  selector: 'app-candidat-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './candidat-form.html',
  styleUrls: ['./candidat-form.scss']
})
export class CandidatFormComponent implements OnInit {
  candidatForm!: FormGroup;
  isEditMode = false;

  selectedImage: File | null = null;
  selectedCv: File | null = null;

  domaines = Object.values(DomainePrincipale);
  labels = DomainePrincipaleLabels;

  private notif = inject(NotificationsService);

  constructor(
    private fb: FormBuilder,
    private candidatService: CandidatService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadCandidat(Number(id));
    }
  }

  onImageSelected(event: any) {
    this.selectedImage = event.target.files[0];
  }

  onCvSelected(event: any) {
    this.selectedCv = event.target.files[0];
  }

  private initForm(): void {
    this.candidatForm = this.fb.group({
      id: [null],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      domainePrincipale: [null, Validators.required],
      posteActuel: ['', Validators.required],
      lienLinkedin: ['', Validators.required],
      lienGitHub: ['', Validators.required],
      fileName: [''],
      lienCV: [''],
      anneesExperience: [0, [Validators.required, Validators.min(0)]],
      status: ['DISPONIBLE'],
      consentementDonnees: [false, Validators.requiredTrue],
      competences: this.fb.array([]),
      dateCreation: [new Date()]
    });
  }

  get competences(): FormArray {
    return this.candidatForm.get('competences') as FormArray;
  }

  addCompetence(comp?: any): void {
    const group = this.fb.group({
      id: [comp?.id || null],
      libelle: [comp?.libelle || '', Validators.required],
      type: [comp?.type || 'HARD_SKILL', Validators.required],
      niveauDeclare: [comp?.niveauDeclare || 'DEBUTANT', Validators.required]
    });
    this.competences.push(group);
  }

  removeCompetence(index: number): void {
    this.competences.removeAt(index);
  }

  private loadCandidat(id: number): void {
    this.candidatService.getById(id).subscribe({
      next: (found) => {
        if (found) {
          this.competences.clear();
          if (found.competences) {
            found.competences.forEach((c: any) => this.addCompetence(c));
          }
          this.candidatForm.patchValue(found);
        }
      }
    });
  }

  onSubmit() {
    if (this.candidatForm.invalid) {
      this.candidatForm.markAllAsTouched();
      this.notif.warning('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const rawValue = this.candidatForm.getRawValue();

    // Préparation des données pour le Backend
    const candidatData = {
      ...rawValue,
      // Forcer l'ID à null en création pour éviter les erreurs 500
      id: this.isEditMode ? rawValue.id : null,
      dateCreation: new Date().toISOString(),
      // Propagation du domaine aux compétences
      competences: rawValue.competences.map((c: any) => ({
        ...c,
        id: this.isEditMode ? c.id : null,
        domainePrincipale: rawValue.domainePrincipale // Doit être en MAJUSCULES (ex: "INFORMATIQUE")
      }))
    };

    const formData = new FormData();

    // Création du Blob JSON avec le type explicite
    const jsonBlob = new Blob([JSON.stringify(candidatData)], {
      type: 'application/json'
    });

    formData.append('candidat', jsonBlob);

    // Vérifie que les noms 'image' et 'cv' correspondent aux @RequestPart du Backend
    if (this.selectedImage) formData.append('image', this.selectedImage);
    if (this.selectedCv) formData.append('cv', this.selectedCv);

    const request$ = this.isEditMode
      ? this.candidatService.update(candidatData.id, formData)
      : this.candidatService.create(formData);

    request$.subscribe({
      next: () => this.handleSuccess(this.isEditMode ? 'Candidat mis à jour' : 'Candidat créé'),
      error: (err) => this.handleError(err)
    });
  }

  private handleSuccess(msg: string) {
    // ✅ Remplacement de alert(msg)
    this.notif.success(msg);
    setTimeout(() => this.router.navigate(['/dashboard']), 1500);
  }

  private handleError(err: any) {
    console.error("Détails de l'erreur:", err);
    const errorMsg = err.error?.message || 'Erreur serveur : vérifiez les fichiers ou le format des données.';
    // ✅ Remplacement de alert(errorMsg)
    this.notif.error(errorMsg);
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
