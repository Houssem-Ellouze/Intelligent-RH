import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink} from '@angular/router';
import {HRNotificationBellComponent} from '../hrnotification-bell-component/hrnotification-bell-component';

@Component({
  selector: 'app-gestions',
  standalone: true,
  imports: [CommonModule, RouterLink, HRNotificationBellComponent],
  templateUrl: './client-dashboard-component.html',
  styleUrls: ['./client-dashboard-component.css']
})
export class GestionsComponent {
  actif: string | null = null;

  toggle(id: string): void {
    this.actif = this.actif === id ? null : id;
  }

  isActive(id: string): boolean {
    return this.actif === id;
  }
}
