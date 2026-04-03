import {ChangeDetectorRef, Component} from '@angular/core';
import { TalentProfile } from '../../models/talent-profile.model';
import { ScoutingService } from '../../services/scouting.service';
import { FormsModule } from '@angular/forms';
import { NgIf, JsonPipe } from '@angular/common'; // Ajout de JsonPipe pour le debug

@Component({
  selector: 'app-profile-upload',
  templateUrl: './profile-upload-component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgIf
  ],
  styleUrls: ['./profile-upload-component.scss']
})
export class ProfileUploadComponent {
  prenom: string = '';
  nom: string = '';
  selectedFile: File | null = null; // Initialisation propre
  profile?: TalentProfile;
  loading: boolean = false;
  errorMessage?: string;

  constructor(private service: ScoutingService , private cdr: ChangeDetectorRef) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.errorMessage = undefined;

    if (file) {
      if (file.type !== 'application/pdf') {
        this.errorMessage = 'Seuls les fichiers PDF sont autorisés.';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Le fichier dépasse 5 Mo.';
        return;
      }
      this.selectedFile = file;
    }
  }

  submit() {
    if (!this.selectedFile || !this.prenom || !this.nom) return;
    this.loading = true;

    this.service.createOrUpdateProfile(this.prenom, this.nom, this.selectedFile).subscribe({
      next: (res) => {
        this.profile = res;
        this.loading = false;
        this.cdr.detectChanges(); // 3. Forcer le rendu HTML
      },
      error: (err) => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
