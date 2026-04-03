import { Injectable, signal } from '@angular/core';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  notifications = signal<Notification[]>([]);
  private counter = 0;

  show(message: string, type: Notification['type'] = 'info') {
    const id = ++this.counter;
    this.notifications.update(n => [...n, { message, type, id }]);
    setTimeout(() => this.dismiss(id), 4000);
  }

  dismiss(id: number) {
    this.notifications.update(n => n.filter(x => x.id !== id));
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string)   { this.show(msg, 'error'); }
  warning(msg: string) { this.show(msg, 'warning'); }
  info(msg: string)    { this.show(msg, 'info'); }
}
