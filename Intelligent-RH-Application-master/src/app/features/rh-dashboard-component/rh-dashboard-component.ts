import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink} from '@angular/router';
import {HRNotificationBellComponent} from '../hrnotification-bell-component/hrnotification-bell-component';
import {DocumentAnalyzerComponent} from '../document-analyzer-service/document-analyzer-service';

@Component({
  selector: 'app-rh-gestions',
  standalone: true,
  imports: [CommonModule, RouterLink, HRNotificationBellComponent],
  templateUrl: './rh-dashboard-component.html',
  styleUrls: ['./rh-dashboard-component.css']
})
export class RhDashboardComponent {
  actif: string | null = null;

  toggle(id: string): void {
    this.actif = this.actif === id ? null : id;
  }

  isActive(id: string): boolean {
    return this.actif === id;
  }
}
