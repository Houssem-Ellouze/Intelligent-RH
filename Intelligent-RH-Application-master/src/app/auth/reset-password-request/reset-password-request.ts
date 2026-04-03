import { Component } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-reset-password-request',
  imports: [
    FormsModule
  ],
  templateUrl: './reset-password-request.html',
  standalone: true,
  styleUrl: './reset-password-request.scss'
})
export class ResetPasswordRequest
{
  email: string = '';

  successMessage = '';

  errorMessage = '';

  constructor(private http: HttpClient , private router:Router) {}

  requestReset() {
    this.successMessage = '';
    this.errorMessage = '';

    this.http.post('http://intelligent-rh:30222/auth/reset-password-request', {
      email: this.email
    }).subscribe({
      next: () => this.successMessage = 'Reset link sent to email.' +
        this.router.navigate(['/reset-password'])
      ,
      error: err => this.errorMessage = 'Error: ' + err.error.message || 'Try again.'
    });
  }
}
