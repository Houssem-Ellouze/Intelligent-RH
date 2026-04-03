import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {ToastComponent} from './features/toast-component/toast-component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ToastComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
}
