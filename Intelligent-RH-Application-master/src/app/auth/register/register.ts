import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth-service';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgForOf
  ],
  styleUrls: ['./register.scss']
})
export class RegisterComponent implements OnInit {

  specialities: string[] = [];

  registerRequest = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
    speciality: ''
  };

  errorMsg: string = '';     // ← Déclaration manquante (cause principale de l'erreur)
  successMsg: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.http.get<string[]>('http://intelligent-rh:30222/auth/specialities')
      .subscribe({
        next: (data) => this.specialities = data,
        error: (err) => console.error('Erreur chargement spécialités', err)
      });
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  register(): void {
    this.errorMsg = '';
    this.successMsg = '';

    // Validation
    if (!this.registerRequest.nom ||
      !this.registerRequest.prenom ||
      !this.registerRequest.email ||
      !this.registerRequest.password ||
      !this.registerRequest.telephone ||
      !this.registerRequest.speciality) {

      this.errorMsg = 'Tous les champs sont obligatoires';
      return;
    }

    console.log('Envoi de la requête d\'inscription...', this.registerRequest);

    this.authService.register(this.registerRequest).subscribe({
      next: (response: any) => {
        console.log('✅ Inscription réussie :', response);
        this.successMsg = response?.message || 'Inscription réussie !';

        // Redirection après un court délai
        setTimeout(() => {
          this.router.navigate(['/activate-account']);
        }, 1200);
      },

      error: (err: HttpErrorResponse) => {
        console.error('❌ Erreur inscription :', err);

        if (err.error?.message) {
          this.errorMsg = err.error.message;
        }
        else if (typeof err.error === 'string') {
          this.errorMsg = err.error;
        }
        else if (err.status === 500) {
          this.errorMsg = 'Erreur interne du serveur. Vérifiez les logs du backend.';
        }
        else {
          this.errorMsg = 'Une erreur est survenue lors de l\'inscription.';
        }
      }
    });
  }
}
