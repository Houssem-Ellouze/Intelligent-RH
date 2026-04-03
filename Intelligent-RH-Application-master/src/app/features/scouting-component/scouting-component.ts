import { Component, OnInit } from '@angular/core';
import {Router, NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive} from '@angular/router';
import { filter } from 'rxjs/operators';
import {NgClass, NgForOf, NgIf} from '@angular/common';

export interface MenuItem {
  path:            string;
  label:           string;
  icon:            string;
  description:     string;
  cardDescription: string;
  colorClass:      string;
  tag:             string;
  badge?:          string;
  stat:            string;
  statLabel:       string;
}

export interface StatPill {
  value: string;
  label: string;
}

@Component({
  selector: 'app-nav-menu',
  templateUrl: './scouting-component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    NgForOf,
    RouterLink,
    NgClass,
    NgIf,
    RouterLinkActive
  ],
  styleUrls: ['./scouting-component.scss']
})
export class ScoutingComponent implements OnInit {

  sidebarCollapsed = false;
  activeItem: MenuItem | null = null;

  // ── Dashboard hero stats ─────────────────────────────
  stats: StatPill[] = [
    { value: '248',  label: 'Talents actifs'   },
    { value: '94%',  label: 'Taux de matching' },
    { value: '12',   label: 'En cours'         },
  ];

  // ── Menu items ───────────────────────────────────────
  menuItems: MenuItem[] = [
    {
      path:            '/profile-score',
      label:           'Score Profil',
      icon:            '🎯',
      description:     'Évaluation & scoring',
      cardDescription: 'Obtenez un score précis basé sur les compétences, l\'expérience et l\'adéquation au poste cible.',
      colorClass:      'blue-card',
      tag:             'IA Scoring',
      badge:           'NEW',
      stat:            '94%',
      statLabel:       'Précision moyenne',
    },
    {
      path:            '/profile-upload',
      label:           'Upload Profil',
      icon:            '📤',
      description:     'Import CV / données',
      cardDescription: 'Importez des CVs, LinkedIn exports ou fiches de poste. Parsing automatique et extraction intelligente.',
      colorClass:      'teal-card',
      tag:             'Import',
      stat:            '1.2k',
      statLabel:       'Profils importés',
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateActiveItem(this.router.url);

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.updateActiveItem(e.urlAfterRedirects);
      });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  hasActiveRoute(): boolean {
    return this.activeItem !== null;
  }

  private updateActiveItem(url: string): void {
    this.activeItem = this.menuItems.find(item => url.startsWith(item.path)) ?? null;
  }
}
