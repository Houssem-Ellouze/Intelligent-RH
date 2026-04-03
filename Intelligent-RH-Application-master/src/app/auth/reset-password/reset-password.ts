import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss']
})
export class ResetPassword {

  token: string = '';
  newPassword: string = '';
  successMessage = '';
  errorMessage = '';

  constructor(private http: HttpClient , private router:Router) {}

  resetPassword() {

    if (!this.token || !this.newPassword) {
      this.errorMessage = 'All fields are required.';
      return;
    }

    const url = `http://intelligent-rh:30222/auth/reset-password?token=${this.token}&newPassword=${this.newPassword}`;

    this.http.post(url, {}).subscribe({
      next: (res: any) => {
        this.successMessage = res.message;
        this.router.navigate(['/login'])
      },
      error: err => {
        this.errorMessage = err.error?.error || 'Error occurred.';
      }
    });
  }
}
