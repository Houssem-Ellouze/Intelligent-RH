import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NotificationsService} from '../../services/notifications.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (notif of notifService.notifications(); track notif.id) {
        <div [class]="'toast toast-' + notif.type"
             (click)="notifService.dismiss(notif.id)">
          <span class="toast-icon">{{ getIcon(notif.type) }}</span>
          <span class="toast-message">{{ notif.message }}</span>
          <button class="toast-close" (click)="notifService.dismiss(notif.id)">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 10px;
      color: #fff;
      cursor: pointer;
      font-size: 14px;
      max-width: 380px;
      min-width: 260px;
      pointer-events: all;
      box-shadow: 0 4px 16px rgba(0,0,0,0.18);
      animation: slide-in 0.25s ease;
      border-left: 4px solid rgba(255,255,255,0.35);
    }

    .toast-message {
      flex: 1;
      line-height: 1.4;
    }

    .toast-icon {
      font-size: 16px;
      flex-shrink: 0;
    }

    .toast-close {
      background: none;
      border: none;
      color: rgba(255,255,255,0.7);
      cursor: pointer;
      font-size: 12px;
      padding: 0;
      line-height: 1;
      flex-shrink: 0;
      transition: color 0.2s;
    }

    .toast-close:hover {
      color: #fff;
    }

    .toast-success { background: #1D9E75; }
    .toast-error   { background: #A32D2D; }
    .toast-warning { background: #BA7517; }
    .toast-info    { background: #185FA5; }

    @keyframes slide-in {
      from { opacity: 0; transform: translateX(40px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class ToastComponent {
  notifService = inject(NotificationsService);

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] ?? 'ℹ';
  }
}
