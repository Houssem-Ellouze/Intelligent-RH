// profile.service.ts
import { Injectable, signal } from '@angular/core';
import {UserProfile} from '../models/profile.model';   // ✅ Pas d'espace

@Injectable({ providedIn: 'root' })
export class ProfileService {

  private _profile = signal<UserProfile>({
    id: '27',
    nom: 'ELLOUZE',
    prenom: 'Houssem',
    email: 'houssem.ellouze@techmail.tn',
    telephone: '+216 22 333 444',
    matricule: 'MAT-27-602',
    poste: 'Développeur Fullstack Senior',
    departement: 'DEVELOPPEMENT_WEB',
    avatar: '/files/get/348356309_229071956495686_958732782696450244_n.jpg',
    github: 'https://github.com/houssem-dev',
    linkedin: 'https://linkedin.com/in/houssem-ellouze',
    cv: '1763117865484.jfif',
    bio: 'Développeur Fullstack Senior spécialisé Angular & Spring Boot.',
    competences: ['Angular', 'Spring Boot', 'Java', 'TypeScript', 'Docker', 'PostgreSQL'],
    dateCreation: new Date('2026-02-13T12:26:04'),
    statut: 'actif',
  });

  readonly profile = this._profile.asReadonly();

  update(data: Partial<UserProfile>): void {
    this._profile.update(p => ({ ...p, ...data }));
  }

  updateAvatar(base64: string): void {
    this._profile.update(p => ({ ...p, avatar: base64 }));
  }

  addCompetence(c: string): void {
    this._profile.update(p => ({
      ...p,
      competences: [...(p.competences ?? []), c],
    }));
  }

  removeCompetence(c: string): void {
    this._profile.update(p => ({
      ...p,
      competences: (p.competences ?? []).filter(x => x !== c),
    }));
  }
}
