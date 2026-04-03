import { Injectable, signal, computed } from '@angular/core';

export type HRModule = 'profils' | 'recrutement' | 'onboarding' | 'scouting';
export type NotifPriority = 'haute' | 'normale' | 'basse';

export interface HRNotification {
  id: string;
  module: HRModule;
  priority: NotifPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  initials?: string;
  action?: { label: string; route: string };
}

export const MODULE_META: Record<HRModule, { label: string; color: string; accent: string }> = {
  profils:     { label: 'Profils',     color: '#6366f1', accent: '#eef2ff' },
  recrutement: { label: 'Recrutement', color: '#0ea5e9', accent: '#e0f2fe' },
  onboarding:  { label: 'Onboarding',  color: '#10b981', accent: '#d1fae5' },
  scouting:    { label: 'Scouting',    color: '#f59e0b', accent: '#fef3c7' },
};

@Injectable({ providedIn: 'root' })
export class HRNotificationService {

  private _notifications = signal<HRNotification[]>([

    // ── RECRUTEMENT ──────────────────────────────────────────────────────────
    // Offres PUBLIEES (id 26, 29, 30) → actions requises
    {
      id: 'r1',
      module: 'recrutement',
      priority: 'haute',
      title: 'Offre active — Ingénieur DevOps',
      message: 'L\'offre #26 "Ingénieur DevOps" est publiée depuis le 22/01. Des candidatures sont en attente de traitement.',
      timestamp: new Date('2026-01-22T09:00:00'),
      read: false,
      initials: 'DO',
      action: { label: 'Voir les candidatures', route: '/recrutement/offres/26' },
    },
    {
      id: 'r2',
      module: 'recrutement',
      priority: 'haute',
      title: 'Nouvelle offre publiée — Full Stack Angular & Spring Boot',
      message: 'L\'offre #29 "Développeur Full Stack Angular & Spring Boot" est en ligne depuis le 24/02. Aucun candidat traité.',
      timestamp: new Date('2026-02-24T08:30:00'),
      read: false,
      initials: 'FS',
      action: { label: 'Gérer l\'offre', route: '/recrutement/offres/29' },
    },
    {
      id: 'r3',
      module: 'recrutement',
      priority: 'haute',
      title: 'Nouvelle offre publiée — Ingénieur DevOps & Cloud',
      message: 'L\'offre #30 "Ingénieur DevOps & Cloud" est publiée depuis le 24/02. En attente d\'affectation d\'un recruteur.',
      timestamp: new Date('2026-02-24T08:45:00'),
      read: false,
      initials: 'DC',
      action: { label: 'Affecter un recruteur', route: '/recrutement/offres/30' },
    },
    {
      id: 'r4',
      module: 'recrutement',
      priority: 'normale',
      title: '22 offres clôturées à archiver',
      message: 'Les offres publiées en janvier 2026 (Fullstack, Cloud, DevOps, Data…) sont clôturées. Un archivage est recommandé.',
      timestamp: new Date('2026-02-01T10:00:00'),
      read: false,
      initials: '📁',
      action: { label: 'Archiver les offres', route: '/recrutement/offres?statut=CLOTUREE' },
    },
    {
      id: 'r5',
      module: 'recrutement',
      priority: 'basse',
      title: 'Bilan recrutement — Janvier 2026',
      message: '22 offres publiées en janvier : Fullstack Senior, Architecte Cloud, Data Scientist, DevOps, UI/UX… Toutes clôturées.',
      timestamp: new Date('2026-02-01T08:00:00'),
      read: true,
      initials: '📊',
      action: { label: 'Voir le bilan', route: '/recrutement/rapports' },
    },

    // ── ONBOARDING ───────────────────────────────────────────────────────────
    {
      id: 'o1',
      module: 'onboarding',
      priority: 'normale',
      title: 'Onboarding terminé — Houssem Ellouze',
      message: 'Houssem Ellouze (MAT-27-602) a finalisé son parcours d\'intégration. 8 onboardings complétés pour ce collaborateur.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      initials: 'HE',
      action: { label: 'Voir le profil', route: '/onboarding/122' },
    },
    {
      id: 'o2',
      module: 'onboarding',
      priority: 'normale',
      title: 'Onboarding terminé — Sonia Trabelsi',
      message: 'Sonia Trabelsi (MAT-66-668) a finalisé son intégration. 7 parcours d\'onboarding complétés au total.',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      read: false,
      initials: 'ST',
      action: { label: 'Voir le profil', route: '/onboarding/121' },
    },
    {
      id: 'o3',
      module: 'onboarding',
      priority: 'basse',
      title: 'Bilan onboarding — 25 parcours terminés',
      message: 'Trabelsi, Ellouze, Kallel, Mansour, Gharbi ont tous finalisé leur intégration (IDs 121→145). Taux de complétion : 100%.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: false,
      initials: '✅',
      action: { label: 'Voir le rapport', route: '/onboarding/rapports' },
    },
    {
      id: 'o4',
      module: 'onboarding',
      priority: 'haute',
      title: 'Doublons détectés — Sami Mansour',
      message: 'Sami Mansour possède 4 entrées onboarding (MAT-69-223, MAT-69-457, MAT-69-73, MAT-69-866). Consolidation recommandée.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      read: false,
      initials: 'SM',
      action: { label: 'Consolider', route: '/onboarding?email=sami.mansour@esprit.tn' },
    },
    {
      id: 'o5',
      module: 'onboarding',
      priority: 'basse',
      title: 'Évaluations post-onboarding à planifier',
      message: 'Les collaborateurs dont l\'onboarding est terminé depuis + de 30 jours (Gharbi, Kallel…) sont éligibles à une évaluation.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: true,
      initials: '📋',
      action: { label: 'Planifier les évaluations', route: '/profils/evaluations' },
    },

    // ── SCOUTING ─────────────────────────────────────────────────────────────
    {
      id: 's1',
      module: 'scouting',
      priority: 'haute',
      title: 'Profil DevOps & Cloud identifié',
      message: 'L\'IA a détecté un profil senior correspondant à 96% aux critères de l\'offre #30 "Ingénieur DevOps & Cloud".',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      initials: '🤖',
      action: { label: 'Voir le profil', route: '/scouting/suggestions' },
    },
    {
      id: 's2',
      module: 'scouting',
      priority: 'normale',
      title: 'Vivier Angular & Spring Boot actif',
      message: '5 profils Full Stack Angular/Spring Boot disponibles dans le vivier, compatibles avec l\'offre #29.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: true,
      initials: '🔍',
      action: { label: 'Explorer le vivier', route: '/scouting/vivier' },
    },

    // ── PROFILS ──────────────────────────────────────────────────────────────
    {
      id: 'p1',
      module: 'profils',
      priority: 'normale',
      title: 'Contrats multiples — Yassine Gharbi',
      message: 'Yassine Gharbi (MAT-67-80, MAT-67-191, MAT-67-905) possède 3 contrats actifs. Une vérification est conseillée.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      read: true,
      initials: 'YG',
      action: { label: 'Voir le profil', route: '/profils/yassine-gharbi' },
    },
    {
      id: 'p2',
      module: 'profils',
      priority: 'basse',
      title: 'Contrats multiples — Houssem Ellouze',
      message: 'Houssem Ellouze cumule 8 matricules distincts (MAT-27-*). Vérifier la cohérence des affectations.',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      read: true,
      initials: 'HE',
      action: { label: 'Voir le profil', route: '/profils/houssem-ellouze' },
    },
  ]);

  readonly notifications  = this._notifications.asReadonly();
  readonly unreadCount    = computed(() => this._notifications().filter(n => !n.read).length);
  readonly hasUnread      = computed(() => this.unreadCount() > 0);
  readonly unreadByModule = (m: HRModule) => computed(() =>
    this._notifications().filter(n => n.module === m && !n.read).length
  );

  markAsRead(id: string): void {
    this._notifications.update(l => l.map(n => n.id === id ? { ...n, read: true } : n));
  }

  markAllAsRead(): void {
    this._notifications.update(l => l.map(n => ({ ...n, read: true })));
  }

  remove(id: string): void {
    this._notifications.update(l => l.filter(n => n.id !== id));
  }

  clearAll(): void {
    this._notifications.set([]);
  }

  add(n: Omit<HRNotification, 'id' | 'timestamp' | 'read'>): void {
    this._notifications.update(l => [{
      ...n,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    }, ...l]);
  }
}
