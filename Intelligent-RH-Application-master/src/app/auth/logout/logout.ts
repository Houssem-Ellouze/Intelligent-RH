import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../auth-service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [NgIf],
  templateUrl: './logout.html',
  styleUrls: ['./logout.css'] // ⚠️ correction ici (styleUrls et pas styleUrl)
})
export class Logout {

  loading = false;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogout(): void {

    this.loading = true;
    this.errorMessage = null;

    this.authService.logout().subscribe({
      next: () => {
        // On supprime tout le localStorage pour être sûr
        localStorage.clear();

        this.loading = false;
        console.log('Déconnexion réussie !');

        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Erreur logout :', err);

        // Même si erreur backend → on supprime le token
        localStorage.clear();

        this.loading = false;
        this.router.navigate(['/login']);
      }
    });
  }
}
