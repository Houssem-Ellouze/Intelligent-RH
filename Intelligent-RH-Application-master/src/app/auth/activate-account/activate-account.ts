import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { CodeInputModule } from 'angular-code-input';
import {NgClass, NgIf} from '@angular/common';
import {AuthService} from '../auth-service';

@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.html',
  standalone: true,
  imports: [
    CodeInputModule,
    NgIf,
    RouterLink
  ],
  styleUrls: ['./activate-account.css']
})
export class ActivateAccountComponent {

  message = '';
  isOkay = true;
  submitted = false;

  isClicked = false;
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onCodeCompleted(token: string) {
    this.submitted = true;

    this.authService.activateAccount(token).subscribe({
      next: () => {
        this.message = 'Your account has been successfully activated.\nNow you can proceed to login';
      },
      error: () => {
        this.message = 'Token has been expired or invalid';
        this.isOkay = false;
      }
    });
  }


}
