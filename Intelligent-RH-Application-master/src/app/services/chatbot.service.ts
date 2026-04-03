import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface Suggestion {
  text: string;
  action: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: Suggestion[];
}

export interface ConversationContext {
  topic?: string;
  resolved?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private contextSubject = new BehaviorSubject<ConversationContext>({});
  public context$ = this.contextSubject.asObservable();

  // Réponses pré-configurées pour NexusRH
  private readonly KNOWLEDGE_BASE = {
    'tarif': 'NexusRH propose 3 plans : Starter (39€/mois jusqu\'à 50 employés), Pro (99€/mois jusqu\'à 500 employés avec IA illimitée), et Enterprise sur devis. Tous incluent 14 jours d\'essai gratuit !',
    'pricing': 'NexusRH propose 3 plans : Starter (39€/mois jusqu\'à 50 employés), Pro (99€/mois jusqu\'à 500 employés avec IA illimitée), et Enterprise sur devis. Tous incluent 14 jours d\'essai gratuit !',
    'fonctionnalités': 'NexusRH offre 6 piliers : Recrutement IA (scoring automatique des CV), Smart Analytics (tableaux de bord temps réel), Talent Growth (gestion des compétences), Workflow Digital (automatisation RH), Legal & Secure (conformité tunisienne), et AI Assistant (chatbot RH 24/7).',
    'features': 'NexusRH offre 6 piliers : Recrutement IA (scoring automatique des CV), Smart Analytics (tableaux de bord temps réel), Talent Growth (gestion des compétences), Workflow Digital (automatisation RH), Legal & Secure (conformité tunisienne), et AI Assistant (chatbot RH 24/7).',
    'recrutement': 'Notre IA analyse automatiquement les CV, effectue un matching intelligent adapté au marché tunisien et propose un scoring des candidats. Disponible à partir du plan Starter avec 10 offres/mois, illimité en Pro.',
    'chatbot': 'Le Chatbot RH intelligent répond aux employés 24/7, simplifie les démarches internes et automatise les demandes récurrentes. Inclus dans le plan Pro et Enterprise.',
    'sécurité': 'Vos données sont hébergées de manière sécurisée en France avec SSL/TLS. NexusRH respecte les réglementations tunisiennes du travail et est conforme aux normes de protection des données.',
    'support': 'Notre équipe support réactive est disponible via email et chat. Le plan Pro inclut un support prioritaire, et Enterprise bénéficie d\'un account manager dédié.',
    'essai': 'Démarrez gratuitement avec 14 jours d\'essai sans carte bancaire requise. Support inclus pendant l\'essai. Garantie de remboursement 30 jours si vous n\'êtes pas satisfait.',
    'onboarding': 'NexusRH automatise complètement le processus d\'onboarding : documents, contrats, configuration des accès. Disponible en plan Pro et Enterprise pour simplifier l\'intégration des nouveaux collaborateurs.',
    'analytics': 'Les tableaux de bord Smart Analytics vous permettent de suivre en temps réel : performance, absences, évolution des équipes. Les analytics prédictifs (plan Pro+) identifient les risques de départ et opportunités de rétention.',
    'intégration': 'NexusRH s\'intègre avec vos systèmes existants. Des intégrations SIRH personnalisées sont disponibles sur les plans Pro et Enterprise. Contactez notre équipe pour vos besoins spécifiques.',
    'conformité': 'NexusRH est développée à Sfax et respecte entièrement les réglementations tunisiennes du travail, ainsi que les standards internationaux de sécurité des données. RGPD compliant.',
    'équipe': 'NexusRH a été fondée en 2021 par d\'anciens DRH et chercheurs en IA. Notre équipe passionnée de 10+ collaborateurs en Tunisie crée une solution moderne adaptée à la réalité des PME tunisiennes.',
    'carrière': 'Rejoignez l\'aventure NexusRH ! Nous recrutons des talents passionnés par l\'IA et les RH. Découvrez nos offres d\'emploi actuelles.',
    'default': 'Bienvenue chez NexusRH ! 👋 Je n\'ai pas compris votre question. Pourriez-vous la reformuler ?\n\nJe peux vous aider sur : Tarifs, Fonctionnalités, Recrutement IA, Chatbot, Sécurité, Support, Essai gratuit, Onboarding, Analytics, Intégrations, Conformité, Équipe, Carrières.'
  };

  constructor() {
    this.initializeChat();
  }

  private initializeChat(): void {
    const welcomeMessage: Message = {
      id: this.generateId(),
      text: 'Bienvenue chez NexusRH 👋\n\nJe suis votre assistant IA pour répondre à toutes vos questions sur notre plateforme RH.',
      sender: 'bot',
      timestamp: new Date(),
      suggestions: [
        { text: '💰 Voir les tarifs', action: 'tarifs' },
        { text: '🚀 Explorer les fonctionnalités', action: 'fonctionnalités' },
        { text: '🤖 Recrutement IA', action: 'recrutement' },
        { text: '🎁 Essai gratuit', action: 'essai' }
      ]
    };
    this.messagesSubject.next([welcomeMessage]);
  }

  sendMessage(text: string): void {
    // Ajouter le message utilisateur
    const userMessage: Message = {
      id: this.generateId(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, userMessage]);

    // Simuler la réponse du bot avec délai
    this.generateBotResponse(text.toLowerCase()).pipe(
      delay(800)
    ).subscribe(response => {
      const botMessage: Message = {
        id: this.generateId(),
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: response.suggestions
      };
      const updatedMessages = this.messagesSubject.value;
      this.messagesSubject.next([...updatedMessages, botMessage]);
    });
  }

  handleSuggestion(action: string): void {
    // Trouver le texte correspondant à l'action
    const textMap: { [key: string]: string } = {
      'tarifs': 'Quels sont vos tarifs ?',
      'fonctionnalités': 'Quelles sont les fonctionnalités principales ?',
      'recrutement': 'Comment fonctionne le recrutement IA ?',
      'essai': 'Je veux essayer gratuitement',
      'chatbot': 'Parlez-moi du chatbot RH',
      'sécurité': 'Comment est sécurisée ma plateforme ?',
      'support': 'Quel est votre support client ?',
      'onboarding': 'Comment fonctionne l\'onboarding ?',
      'analytics': 'Que proposez-vous en analytics ?',
      'intégration': 'Quelles intégrations proposez-vous ?',
      'conformité': 'Êtes-vous conforme aux lois ?',
      'équipe': 'Qui êtes-vous ?',
      'carrière': 'Vous recruitez ?'
    };

    const message = textMap[action] || action;
    this.sendMessage(message);
  }

  private generateBotResponse(userInput: string): Observable<{ text: string; suggestions?: Suggestion[] }> {
    let response = this.KNOWLEDGE_BASE['default'];
    let suggestions: Suggestion[] | undefined = undefined;

    // Déterminer la catégorie
    for (const [key, value] of Object.entries(this.KNOWLEDGE_BASE)) {
      if (key !== 'default' && userInput.includes(key)) {
        response = value;
        this.contextSubject.next({ topic: key });
        suggestions = this.getSuggestionsForTopic(key);
        break;
      }
    }

    // Ajouter de la variabilité aux réponses
    if (response === this.KNOWLEDGE_BASE['default']) {
      // Chercher des mots-clés partiels
      const keywords = Object.keys(this.KNOWLEDGE_BASE).filter(k => k !== 'default');
      const foundKeyword = keywords.find(keyword =>
        userInput.includes(keyword.charAt(0)) || userInput.includes(keyword.slice(0, 3))
      );
      if (foundKeyword) {
        response = this.KNOWLEDGE_BASE[foundKeyword as keyof typeof this.KNOWLEDGE_BASE];
        suggestions = this.getSuggestionsForTopic(foundKeyword);
      } else {
        // Suggestions par défaut si pas de catégorie trouvée
        suggestions = [
          { text: '💰 Voir les tarifs', action: 'tarifs' },
          { text: '🚀 Fonctionnalités', action: 'fonctionnalités' },
          { text: '🤖 Recrutement IA', action: 'recrutement' },
          { text: '🎁 Essai gratuit', action: 'essai' }
        ];
      }
    }

    return new Observable(observer => {
      observer.next({ text: response, suggestions });
      observer.complete();
    });
  }

  private getSuggestionsForTopic(topic: string): Suggestion[] {
    const suggestionMap: { [key: string]: Suggestion[] } = {
      'tarifs': [
        { text: '📊 Plan Starter', action: 'starter' },
        { text: '🚀 Plan Pro', action: 'pro' },
        { text: '🏢 Plan Enterprise', action: 'enterprise' }
      ],
      'pricing': [
        { text: '📊 Plan Starter', action: 'starter' },
        { text: '🚀 Plan Pro', action: 'pro' },
        { text: '🏢 Plan Enterprise', action: 'enterprise' }
      ],
      'fonctionnalités': [
        { text: '🤖 Recrutement IA', action: 'recrutement' },
        { text: '📈 Analytics', action: 'analytics' },
        { text: '💬 Chatbot RH', action: 'chatbot' }
      ],
      'features': [
        { text: '🤖 Recrutement IA', action: 'recrutement' },
        { text: '📈 Analytics', action: 'analytics' },
        { text: '💬 Chatbot RH', action: 'chatbot' }
      ],
      'recrutement': [
        { text: '🎁 Essayer gratuitement', action: 'essai' },
        { text: '👥 Voir les tarifs', action: 'tarifs' },
        { text: '📖 Support', action: 'support' }
      ],
      'chatbot': [
        { text: '🎁 Essayer gratuitement', action: 'essai' },
        { text: '👥 Voir les tarifs', action: 'tarifs' },
        { text: '📖 Onboarding', action: 'onboarding' }
      ],
      'essai': [
        { text: '🚀 Créer un compte', action: 'signup' },
        { text: '👥 Voir les tarifs', action: 'tarifs' },
        { text: '📊 Fonctionnalités', action: 'fonctionnalités' }
      ]
    };

    return suggestionMap[topic] || [
      { text: '💰 Voir les tarifs', action: 'tarifs' },
      { text: '📖 Contacter le support', action: 'support' }
    ];
  }

  reset(): void {
    this.messagesSubject.next([]);
    this.contextSubject.next({});
    this.initializeChat();
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
