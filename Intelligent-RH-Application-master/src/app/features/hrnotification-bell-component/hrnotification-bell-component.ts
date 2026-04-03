import {
  Component, inject, signal, HostListener, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {HRNotificationPanelComponent} from '../hrnotification-panel/hrnotification-panel';
import {HRNotificationService} from '../../services/notification.service';


@Component({
  selector: 'app-hr-notification-bell',
  standalone: true,
  imports: [CommonModule, HRNotificationPanelComponent],
  template: `
    <div class="bell-wrapper" [class.open]="isOpen()">

      <button class="bell-btn" (click)="toggle()"
        [class.has-unread]="svc.hasUnread()"
        [attr.aria-label]="'Notifications — ' + svc.unreadCount() + ' non lues'">

        <!-- Bell SVG -->
        <svg class="bell-icon" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>

        @if (svc.hasUnread()) {
          <span class="bell-dot">
            @if (svc.unreadCount() > 9) { <span class="dot-label">9+</span> }
            @else if (svc.unreadCount() > 1) { <span class="dot-label">{{ svc.unreadCount() }}</span> }
          </span>
        }
      </button>

      @if (isOpen()) {
        <div class="panel-anchor">
          <app-hr-notification-panel (close)="isOpen.set(false)" />
        </div>
      }
    </div>
  `,
  styles: [`
    .bell-wrapper { position:relative; }

    .bell-btn {
      position:relative; width:42px; height:42px;
      border:none; background:transparent; cursor:pointer;
      border-radius:12px; color:#64748b;
      display:flex; align-items:center; justify-content:center;
      transition:all .2s; outline:none;
    }
    .bell-btn:hover, .bell-wrapper.open .bell-btn {
      background:#f1f5f9; color:#0f172a;
    }

    .bell-icon { width:21px; height:21px; }

    .bell-btn.has-unread .bell-icon {
      animation: bellShake 3s ease-in-out infinite;
    }
    @keyframes bellShake {
      0%,90%,100% { transform:rotate(0); }
      92% { transform:rotate(-12deg); }
      95% { transform:rotate(12deg); }
      97% { transform:rotate(-8deg); }
      99% { transform:rotate(0); }
    }

    .bell-dot {
      position:absolute; top:5px; right:5px;
      min-width:8px; height:8px;
      background:#ef4444; border:2px solid #fff;
      border-radius:99px; display:flex; align-items:center; justify-content:center;
      animation:dotAppear .3s cubic-bezier(.34,1.56,.64,1);
    }
    @keyframes dotAppear { from { transform:scale(0); } to { transform:scale(1); } }

    .dot-label {
      font-size:8px; font-weight:800; color:#fff;
      padding:0 2px; min-width:16px; height:16px;
      display:flex; align-items:center; justify-content:center;
    }

    .panel-anchor {
      position:absolute; top:calc(100% + 10px); right:0; z-index:1000;
    }
  `],
})
export class HRNotificationBellComponent {
  protected svc    = inject(HRNotificationService);
  private   elRef  = inject(ElementRef);
  protected isOpen = signal(false);

  toggle() { this.isOpen.update(v => !v); }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.elRef.nativeElement.contains(e.target)) this.isOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEsc() { this.isOpen.set(false); }
}
