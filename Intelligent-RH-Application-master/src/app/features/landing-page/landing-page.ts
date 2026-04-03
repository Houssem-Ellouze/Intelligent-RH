import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {ChatbotComponent} from '../chatbot-component/chatbot-component';

interface Feature {
  icon: string;
  title: string;
  description: string;
  tag: string;
}

interface Stat {
  value: string;
  label: string;
  suffix: string;
}

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, ChatbotComponent],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.scss']
})
export class LandingComponent implements OnInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private animationId!: number;
  private particles: any[] = [];
  isMenuOpen = false;
  activeTestimonial = 0;
  private testimonialInterval!: any;

  // 🔥 FEATURES – Positionnement Start-up Sfax
  features: Feature[] = [
    {
      icon: '🚀',
      title: 'Recrutement Intelligent Local',
      description: 'Optimisé pour le marché tunisien et sfaxien : analyse automatique des CV, matching intelligent et scoring adapté aux profils locaux.',
      tag: 'IA Made in Tunisia'
    },
    {
      icon: '📊',
      title: 'Pilotage RH pour PME & Start-ups',
      description: 'Tableaux de bord simples et puissants pour suivre performance, absences et évolution des équipes en temps réel.',
      tag: 'Smart Analytics'
    },
    {
      icon: '🎯',
      title: 'Gestion des Compétences',
      description: 'Cartographie des talents, suivi des compétences techniques et accompagnement de la croissance interne.',
      tag: 'Talent Growth'
    },
    {
      icon: '⚡',
      title: 'Digitalisation RH Complète',
      description: 'Automatisation des congés, contrats, onboarding et gestion administrative adaptée aux entreprises tunisiennes.',
      tag: 'Workflow Digital'
    },
    {
      icon: '🛡️',
      title: 'Conformité Tunisienne',
      description: 'Respect des réglementations locales du travail et gestion sécurisée des données.',
      tag: 'Legal & Secure'
    },
    {
      icon: '💬',
      title: 'Assistant RH Intelligent',
      description: 'Assistant conversationnel pour répondre aux employés et simplifier les démarches internes.',
      tag: 'AI Assistant'
    }
  ];

  // 📊 STATS – Croissance Start-up
  stats: Stat[] = [
    { value: '95', suffix: '%', label: 'Satisfaction clients' },
    { value: '50', suffix: '%', label: 'Temps administratif réduit' },
    { value: '2×', suffix: '', label: 'Croissance des équipes' },
    { value: '100', suffix: '+', label: 'Entreprises en Tunisie' }
  ];

  // 💬 TÉMOIGNAGES – Écosystème Sfax
  testimonials: Testimonial[] = [
    {
      quote: 'Grâce à cette solution développée à Sfax, nous avons structuré notre service RH et gagné un temps précieux.',
      author: 'Ahmed Trabelsi',
      role: 'CEO',
      company: 'SfaxTech Solutions',
      avatar: 'AT'
    },
    {
      quote: 'Un outil moderne et adapté à la réalité des PME tunisiennes. Simple, efficace et innovant.',
      author: 'Rim Kallel',
      role: 'Responsable RH',
      company: 'Digital Factory TN',
      avatar: 'RK'
    },
    {
      quote: 'La digitalisation de nos processus RH nous a permis de mieux accompagner notre croissance.',
      author: 'Youssef Chaari',
      role: 'Fondateur',
      company: 'Innovatech Sfax',
      avatar: 'YC'
    }
  ];

  // 🧭 NAVIGATION
  navLinks = [
    { label: 'À propos', href: '#about' },
    { label: 'Fonctionnalités', href: '#features' },
    { label: 'Témoignages', href: '#testimonials' },
    { label: 'Tarifs', href: '#pricing' },
  ];

  isAnnual = true;

  // 🌍 VALEURS – ADN Start-up Sfax
  values = [
    {
      icon: '🌍',
      title: 'Innovation Locale',
      desc: 'Une solution développée à Sfax pour accompagner la transformation digitale des entreprises tunisiennes.'
    },
    {
      icon: '🤝',
      title: 'Proximité & Accompagnement',
      desc: 'Un support humain, réactif et proche de nos clients.'
    },
    {
      icon: '🔐',
      title: 'Sécurité des Données',
      desc: 'Vos données sont protégées et hébergées de manière sécurisée.'
    }
  ];

  // 🔄 Lifecycle
  ngOnInit(): void {
    this.testimonialInterval = setInterval(() => {
      this.activeTestimonial =
        (this.activeTestimonial + 1) % this.testimonials.length;
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.testimonialInterval) clearInterval(this.testimonialInterval);
  }

  // 📱 Menu Mobile
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // 💬 Témoignages
  setTestimonial(index: number): void {
    this.activeTestimonial = index;
  }

  // 🎯 Scroll Smooth
  scrollTo(href: string): void {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    this.isMenuOpen = false;
  }
}
