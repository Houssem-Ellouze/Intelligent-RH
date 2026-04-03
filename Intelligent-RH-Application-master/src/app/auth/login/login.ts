import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class LoginComponent {
  form: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit(): void {
    if (this.form.invalid) return;

    this.authService.authenticate(this.form.value).subscribe({
      next: () => {
        // Le rôle est déjà stocké par AuthService.authenticate()
        const role = this.authService.getUserRole();
        console.log('Rôle récupéré depuis localStorage:', role);

        // Rediriger selon le rôle
        this.redirectByRole(role);
      },
      error: () => this.error = 'Email ou mot de passe invalide'
    });
  }

  private redirectByRole(role: string | null): void {
    if (!role) {
      console.log('Pas de rôle trouvé - Redirection par défaut');
      this.router.navigate(['/rh-dashboard']);
      return;
    }

    const normalizedRole = role.toUpperCase();
    console.log('Rôle normalisé:', normalizedRole);

    if (normalizedRole === 'RH' || normalizedRole === 'MANAGER') {
      console.log('Redirection vers RH Dashboard');
      this.router.navigate(['/rh-dashboard']);
    } else if (normalizedRole === 'CLIENT') {
      console.log('Redirection vers Client Dashboard');
      this.router.navigate(['/client-dashboard']);
    } else if (normalizedRole === 'SUPER_ADMIN') {
      console.log('Redirection vers Admin Dashboard');
      this.router.navigate(['/rh-dashboard']);
    } else {
      console.log('Rôle non reconnu - Redirection par défaut');
      this.router.navigate(['/client-dashboard']);
    }
  }
}
