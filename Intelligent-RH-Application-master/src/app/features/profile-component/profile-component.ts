// profile.component.ts
import {
  Component, inject, signal, computed, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule }       from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule }       from '@angular/router';
import {ProfileService} from '../../services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile-component.html',
  styleUrls: ['./profile-component.scss'],
})
export class ProfileComponent {

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  protected svc     = inject(ProfileService);
  private   fb      = inject(FormBuilder);
  protected profile = this.svc.profile;

  // ── State ──────────────────────────────────────────────────────────────────
  protected editMode      = signal(false);
  protected activeTab     = signal<'infos' | 'competences' | 'contrat'>('infos');
  protected newCompetence = signal('');
  protected saveSuccess   = signal(false);

  protected initials = computed(() => {
    const p = this.profile();
    return `${p.prenom[0]}${p.nom[0]}`.toUpperCase();
  });

  // ── Form ───────────────────────────────────────────────────────────────────
  protected form = this.fb.group({
    prenom:      [this.profile().prenom,      [Validators.required, Validators.minLength(2)]],
    nom:         [this.profile().nom,         [Validators.required, Validators.minLength(2)]],
    email:       [this.profile().email,       [Validators.required, Validators.email]],
    telephone:   [this.profile().telephone,   []],
    poste:       [this.profile().poste,       []],
    departement: [this.profile().departement, []],
    bio:         [this.profile().bio,         [Validators.maxLength(300)]],
  });

  // ── Methods ────────────────────────────────────────────────────────────────
  startEdit(): void {
    const p = this.profile();
    this.form.patchValue({
      prenom: p.prenom, nom: p.nom, email: p.email,
      telephone: p.telephone, poste: p.poste,
      departement: p.departement, bio: p.bio,
    });
    this.editMode.set(true);
  }

  cancelEdit(): void {
    this.editMode.set(false);
    this.form.reset();
  }

  saveProfile(): void {
    if (this.form.invalid) return;
    this.svc.update(this.form.value as any);
    this.editMode.set(false);
    this.saveSuccess.set(true);
    setTimeout(() => this.saveSuccess.set(false), 3000);
  }

  onAvatarClick(): void {
    this.fileInput.nativeElement.click();
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => this.svc.updateAvatar(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  addCompetence(): void {
    const val = this.newCompetence().trim();
    if (val && !(this.profile().competences ?? []).includes(val)) {
      this.svc.addCompetence(val);
      this.newCompetence.set('');
    }
  }

  removeCompetence(c: string): void {
    this.svc.removeCompetence(c);
  }

  onCompetenceKey(e: KeyboardEvent): void {
    if (e.key === 'Enter') { e.preventDefault(); this.addCompetence(); }
  }

  setTab(t: 'infos' | 'competences' | 'contrat'): void {
    this.activeTab.set(t);
    this.editMode.set(false);
  }

  get bioLength(): number {
    return (this.form.get('bio')?.value ?? '').length;
  }

  statutLabel(s: string): string {
    return { actif: 'Actif', inactif: 'Inactif', en_attente: 'En attente' }[s] ?? s;
  }
}
