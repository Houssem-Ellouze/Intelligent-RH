import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { DecimalPipe, DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import {RhPredictionService} from '../../services/rh-prediction';

export interface CVResult {
  best_job: string;
  match_percentage: number;
  model_type: string;
  top_jobs: {
    job: string;
    score: number;           // Score hybride final
    ai_confidence: number;   // Analyse sémantique (ML)
    skills_match: number;    // Couverture des mots-clés (DB)
    matched_skills: string[];
    missing_skills: string[];
  }[];
}

@Component({
  selector: 'app-rh-prediction',
  templateUrl: './rh-prediction.html',
  standalone: true,
  imports: [ NgIf, NgForOf, NgClass],
  styleUrl: './rh-prediction.scss'
})
export class RhPredictionComponent {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  selectedFile: File | null = null;
  result: CVResult | null = null;
  loading = false;
  error = '';
  isDragging = false;
  today = new Date();

  constructor(
    private rhService: RhPredictionService,
    private cdr: ChangeDetectorRef
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this._setFile(input.files[0]);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files[0]) this._setFile(event.dataTransfer.files[0]);
  }

  private _setFile(file: File): void {
    if (file.type !== 'application/pdf') {
      this.error = 'Seuls les fichiers PDF sont acceptés.';
      return;
    }
    this.selectedFile = file;
    this.result = null;
    this.error = '';
    this.cdr.detectChanges();
  }

  uploadCV(): void {
    if (!this.selectedFile || this.loading) return;

    this.loading = true;
    this.error = '';
    this.result = null;
    this.cdr.detectChanges();

    this.rhService.uploadCv(this.selectedFile).subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.success) {
          // Mapping du format Backend (details.found/missing) vers Frontend
          this.result = {
            best_job: res.best_job,
            match_percentage: res.match_percentage,
            model_type: 'Analyse Hybride (Sémantique + Pondération SQL)',
            top_jobs: res.top_matches.map((m: any) => ({
              job: m.job,
              score: m.match_percentage,
              ai_confidence: m.details.ai_confidence,
              skills_match: m.details.skills_match,
              matched_skills: m.details.found,
              missing_skills: m.details.missing
            }))
          };
        } else {
          this.error = res.message || "Erreur lors de l'analyse.";
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.error = "❌ Serveur IA injoignable (Vérifiez le port 5000).";
        this.cdr.detectChanges();
      }
    });
  }

  reset(): void {
    this.selectedFile = null;
    this.result = null;
    this.error = '';
    if (this.fileInputRef?.nativeElement) this.fileInputRef.nativeElement.value = '';
    this.cdr.detectChanges();
  }
}
