import {
  Component, inject, signal, computed, output, HostListener, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {HRModule, HRNotificationService, MODULE_META, NotifPriority} from '../../services/notification.service';

// ─── Notification Panel ───────────────────────────────────────────────────────
@Component({
  selector: 'app-hr-notification-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="panel">

  <!-- ── Header ── -->
  <div class="panel-header">
    <div class="panel-header__left">
      <span class="panel-title">Notifications</span>
      @if (svc.unreadCount() > 0) {
        <span class="badge-count">{{ svc.unreadCount() }}</span>
      }
    </div>
    <div class="panel-header__actions">
      @if (svc.unreadCount() > 0) {
        <button class="btn-ghost" (click)="svc.markAllAsRead()">Tout lire</button>
      }
      <button class="btn-icon-close" (click)="close.emit()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
  </div>

  <!-- ── Module tabs ── -->
  <div class="tabs">
    <button class="tab" [class.active]="activeTab() === 'all'" (click)="setTab('all')">
      Tout
      @if (svc.unreadCount() > 0) { <span class="tab-dot"></span> }
    </button>
    @for (mod of modules; track mod) {
      <button class="tab" [class.active]="activeTab() === mod" (click)="setTab(mod)"
        [style.--tab-color]="meta[mod].color">
        <span class="tab-icon" [style.background]="meta[mod].accent" [style.color]="meta[mod].color">
          {{ moduleIcon(mod) }}
        </span>
        {{ meta[mod].label }}
        @if (svc.unreadByModule(mod)() > 0) {
          <span class="tab-badge" [style.background]="meta[mod].color">{{ svc.unreadByModule(mod)() }}</span>
        }
      </button>
    }
  </div>

  <!-- ── Priority filter ── -->
  <div class="priority-bar">
    @for (p of priorities; track p) {
      <button class="prio-btn" [class.active]="activePriority() === p"
        (click)="setPriority(p)" [attr.data-p]="p">
        <span class="prio-dot"></span>{{ p | titlecase }}
      </button>
    }
    <button class="prio-btn" [class.active]="activePriority() === 'all'"
      (click)="setPriority('all')">Toutes</button>
  </div>

  <!-- ── List ── -->
  <div class="notif-list">
    @if (filtered().length === 0) {
      <div class="empty-state">
        <div class="empty-icon">🔔</div>
        <p>Aucune notification</p>
        <span>Vous êtes à jour !</span>
      </div>
    }
    @for (n of filtered(); track n.id) {
      <div class="notif-item" [class.unread]="!n.read"
        [style.--mod-color]="meta[n.module].color"
        [style.--mod-accent]="meta[n.module].accent"
        (click)="svc.markAsRead(n.id)">

        <!-- left bar -->
        <span class="item-bar" [style.background]="meta[n.module].color"></span>

        <!-- avatar -->
        <div class="item-avatar" [style.background]="meta[n.module].accent" [style.color]="meta[n.module].color">
          {{ n.initials }}
        </div>

        <!-- content -->
        <div class="item-body">
          <div class="item-top">
            <span class="item-module-tag"
              [style.background]="meta[n.module].accent"
              [style.color]="meta[n.module].color">
              {{ meta[n.module].label }}
            </span>
            <span class="item-priority" [attr.data-p]="n.priority">{{ n.priority }}</span>
            <span class="item-time">{{ relTime(n.timestamp) }}</span>
          </div>
          <p class="item-title">{{ n.title }}</p>
          <p class="item-msg">{{ n.message }}</p>
          @if (n.action) {
            <button class="item-action" [style.color]="meta[n.module].color"
              (click)="$event.stopPropagation()">
              {{ n.action.label }} →
            </button>
          }
        </div>

        <!-- unread dot -->
        @if (!n.read) {
          <span class="unread-dot" [style.background]="meta[n.module].color"></span>
        }

        <!-- remove -->
        <button class="item-remove" (click)="$event.stopPropagation(); svc.remove(n.id)"
          aria-label="Supprimer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
    }
  </div>

  <!-- ── Footer ── -->
  @if (svc.notifications().length > 0) {
    <div class="panel-footer">
      <button class="btn-ghost danger" (click)="svc.clearAll()">Effacer tout</button>
      <span class="footer-count">{{ svc.notifications().length }} notifications</span>
    </div>
  }

</div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

    :host { font-family: 'DM Sans', sans-serif; }

    .panel {
      width: 420px;
      background: #ffffff;
      border: 1px solid #e8eaf0;
      border-radius: 20px;
      box-shadow: 0 24px 64px -8px rgba(15,23,42,.14), 0 4px 16px rgba(15,23,42,.05);
      overflow: hidden;
      animation: slideIn .22s cubic-bezier(.16,1,.3,1);
    }

    @keyframes slideIn {
      from { opacity:0; transform:translateY(-10px) scale(.97); }
      to   { opacity:1; transform:translateY(0) scale(1); }
    }

    /* ── Header ── */
    .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 20px 14px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    }
    .panel-header__left { display:flex; align-items:center; gap:10px; }
    .panel-title { font-size:15px; font-weight:700; color:#f8fafc; letter-spacing:-.2px; }
    .badge-count {
      background: #ef4444; color:#fff; font-size:11px; font-weight:700;
      padding:2px 8px; border-radius:99px; min-width:20px; text-align:center;
      animation: badgePop .3s cubic-bezier(.34,1.56,.64,1);
    }
    @keyframes badgePop { from { transform:scale(0); } to { transform:scale(1); } }
    .panel-header__actions { display:flex; align-items:center; gap:6px; }

    /* ── Tabs ── */
    .tabs {
      display:flex; gap:2px; padding:12px 16px 0;
      border-bottom:1px solid #f1f5f9;
      overflow-x:auto; scrollbar-width:none;
      background:#fafbfd;
    }
    .tabs::-webkit-scrollbar { display:none; }
    .tab {
      display:flex; align-items:center; gap:6px;
      padding:7px 12px; border:none; background:transparent;
      font-family:'DM Sans',sans-serif; font-size:12.5px; font-weight:500;
      color:#64748b; cursor:pointer; border-radius:10px 10px 0 0;
      white-space:nowrap; transition:all .15s; position:relative;
    }
    .tab.active {
      background:#fff; color:#0f172a; font-weight:600;
      box-shadow:0 -1px 0 0 #e2e8f0, 1px 0 0 #e2e8f0, -1px 0 0 #e2e8f0;
    }
    .tab-icon {
      width:18px; height:18px; border-radius:5px;
      display:flex; align-items:center; justify-content:center;
      font-size:10px;
    }
    .tab-badge {
      color:#fff; font-size:10px; font-weight:700;
      padding:1px 5px; border-radius:99px; min-width:16px; text-align:center;
    }
    .tab-dot {
      position:absolute; top:6px; right:6px;
      width:6px; height:6px; background:#ef4444; border-radius:50%;
    }

    /* ── Priority bar ── */
    .priority-bar {
      display:flex; gap:4px; padding:10px 16px;
      border-bottom:1px solid #f1f5f9; background:#fff;
    }
    .prio-btn {
      display:flex; align-items:center; gap:5px;
      padding:4px 10px; border:1px solid #e2e8f0;
      background:#fff; border-radius:99px;
      font-family:'DM Sans',sans-serif; font-size:11.5px; font-weight:500;
      color:#64748b; cursor:pointer; transition:all .15s;
    }
    .prio-btn.active { background:#0f172a; color:#fff; border-color:#0f172a; }
    .prio-dot { width:6px; height:6px; border-radius:50%; }
    .prio-btn[data-p="haute"]   .prio-dot { background:#ef4444; }
    .prio-btn[data-p="normale"] .prio-dot { background:#f59e0b; }
    .prio-btn[data-p="basse"]   .prio-dot { background:#10b981; }

    /* ── List ── */
    .notif-list { max-height:380px; overflow-y:auto; scrollbar-width:thin; scrollbar-color:#e2e8f0 transparent; }

    .empty-state {
      display:flex; flex-direction:column; align-items:center;
      padding:52px 24px; gap:6px; color:#94a3b8;
    }
    .empty-icon { font-size:36px; margin-bottom:4px; }
    .empty-state p { margin:0; font-size:14px; font-weight:600; color:#64748b; }
    .empty-state span { font-size:12px; }

    /* item */
    .notif-item {
      display:flex; align-items:flex-start; gap:12px;
      padding:14px 18px 14px 14px;
      border-bottom:1px solid #f8fafc;
      position:relative; cursor:pointer;
      transition:background .15s;
    }
    .notif-item:last-child { border-bottom:none; }
    .notif-item:hover { background:#fafbfd; }

    .item-bar {
      position:absolute; left:0; top:10px; bottom:10px;
      width:3px; border-radius:0 3px 3px 0;
    }

    .item-avatar {
      width:36px; height:36px; border-radius:10px;
      display:flex; align-items:center; justify-content:center;
      font-size:12px; font-weight:700; flex-shrink:0; margin-top:2px;
    }

    .item-body { flex:1; min-width:0; }

    .item-top { display:flex; align-items:center; gap:6px; margin-bottom:4px; flex-wrap:wrap; }

    .item-module-tag {
      font-size:10.5px; font-weight:600; padding:2px 8px; border-radius:99px;
    }

    .item-priority {
      font-size:10px; font-weight:600; padding:2px 7px; border-radius:99px; text-transform:uppercase; letter-spacing:.4px;
    }
    .item-priority[data-p="haute"]   { background:#fee2e2; color:#dc2626; }
    .item-priority[data-p="normale"] { background:#fef9c3; color:#b45309; }
    .item-priority[data-p="basse"]   { background:#dcfce7; color:#15803d; }

    .item-time { font-size:11px; color:#94a3b8; margin-left:auto; white-space:nowrap; }

    .item-title { margin:0 0 3px; font-size:13px; font-weight:600; color:#0f172a; line-height:1.4; }
    .item-msg   { margin:0; font-size:12px; color:#64748b; line-height:1.5;
      display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }

    .item-action {
      margin-top:8px; padding:0; border:none; background:none;
      font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600;
      cursor:pointer; transition:opacity .15s;
    }
    .item-action:hover { opacity:.7; }

    .unread-dot {
      width:8px; height:8px; border-radius:50%; flex-shrink:0; margin-top:6px;
      box-shadow:0 0 0 2px rgba(255,255,255,.8);
    }

    .item-remove {
      opacity:0; position:absolute; top:10px; right:10px;
      width:22px; height:22px; border:none; background:#f1f5f9;
      border-radius:6px; cursor:pointer; display:flex; align-items:center;
      justify-content:center; color:#64748b; transition:all .15s;
    }
    .notif-item:hover .item-remove { opacity:1; }
    .item-remove:hover { background:#fee2e2; color:#dc2626; }

    /* ── Footer ── */
    .panel-footer {
      display:flex; align-items:center; justify-content:space-between;
      padding:11px 20px; border-top:1px solid #f1f5f9; background:#fafbfd;
    }
    .footer-count { font-size:11.5px; color:#94a3b8; }

    /* Buttons */
    .btn-ghost {
      border:none; background:none; font-family:'DM Sans',sans-serif;
      font-size:12.5px; font-weight:500; color:#94a3b8; cursor:pointer;
      padding:5px 10px; border-radius:8px; transition:all .15s;
    }
    .btn-ghost:hover { background:#f1f5f9; color:#475569; }
    .btn-ghost.danger:hover { background:#fee2e2; color:#dc2626; }

    .btn-icon-close {
      width:28px; height:28px; border:none; background:rgba(255,255,255,.1);
      border-radius:8px; cursor:pointer; display:flex; align-items:center;
      justify-content:center; color:#94a3b8; transition:all .15s;
    }
    .btn-icon-close:hover { background:rgba(255,255,255,.2); color:#f8fafc; }
  `],
})
export class HRNotificationPanelComponent {
  protected svc      = inject(HRNotificationService);
  close              = output<void>();
  protected meta     = MODULE_META;
  protected modules: HRModule[]      = ['profils', 'recrutement', 'onboarding', 'scouting'];
  protected priorities: NotifPriority[] = ['haute', 'normale', 'basse'];

  private _tab      = signal<HRModule | 'all'>('all');
  private _priority = signal<NotifPriority | 'all'>('all');
  protected activeTab      = this._tab.asReadonly();
  protected activePriority = this._priority.asReadonly();

  protected filtered = computed(() => {
    let list = this.svc.notifications();
    if (this._tab() !== 'all')      list = list.filter(n => n.module === this._tab());
    if (this._priority() !== 'all') list = list.filter(n => n.priority === this._priority());
    return list;
  });

  setTab(t: HRModule | 'all')           { this._tab.set(t); }
  setPriority(p: NotifPriority | 'all') { this._priority.set(p); }

  moduleIcon(m: HRModule): string {
    return { profils:'👤', recrutement:'📋', onboarding:'🚀', scouting:'🔍' }[m];
  }

  relTime(d: Date): string {
    const s = (Date.now() - d.getTime()) / 1000;
    if (s < 60)    return 'maintenant';
    if (s < 3600)  return `${Math.floor(s/60)}min`;
    if (s < 86400) return `${Math.floor(s/3600)}h`;
    return `${Math.floor(s/86400)}j`;
  }
}
