import { Component, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { DocumentAnalyzerService } from '../../services/document-analyzer-service';
import { RecommendResponse } from '../../models/document';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-document-analyzer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-analyzer-service.html',
  styleUrls: ['./document-analyzer-service.scss']
})
export class DocumentAnalyzerComponent implements OnDestroy {
  // Ajoutez ces propriétés dans votre composant
  isChatOpen = false;
  hasUnreadMessages = false;
  unreadCount = 0;

// Méthode pour ouvrir/fermer
  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;

    if (this.isChatOpen) {
      this.hasUnreadMessages = false;
      this.unreadCount = 0;
      setTimeout(() => this.scrollToBottom(), 300);
    }
  }

// Modifiez votre méthode addMessage pour gérer les notifications
  addMessage(type: 'user' | 'bot' | 'system', content: string): void {
    this.messages = [...this.messages, {
      type: type,
      content: content,
      timestamp: new Date()
    }];

    // Gestion des notifications si le chat est fermé
    if (!this.isChatOpen && type === 'bot') {
      this.hasUnreadMessages = true;
      this.unreadCount++;
    }

    setTimeout(() => this.scrollToBottom(), 50);
  }
  private destroy$ = new Subject<void>();
  private chatbot: AIChatbotLogic | null = null;
  private isViewInitialized = false;

  // Utiliser des setters pour les ViewChild
  @ViewChild('chatMessages') set chatMessagesRef(ref: ElementRef<HTMLDivElement>) {
    this._chatMessagesRef = ref;
    this.tryInitializeChatbot();
  }
  private _chatMessagesRef!: ElementRef<HTMLDivElement>;

  @ViewChild('fileInput') set fileInputRef(ref: ElementRef<HTMLInputElement>) {
    this._fileInputRef = ref;
    this.tryInitializeChatbot();
  }
  private _fileInputRef!: ElementRef<HTMLInputElement>;

  @ViewChild('messageInput') set messageInputRef(ref: ElementRef<HTMLInputElement>) {
    this._messageInputRef = ref;
    this.tryInitializeChatbot();
  }
  private _messageInputRef!: ElementRef<HTMLInputElement>;

  currentMessage = '';
  isTyping = false;
  showFileUpload = false;
  selectedFile: File | null = null;
  fileUploaded = false;

  readonly quickQuestions = [
    { label: '👤 Nom complet', text: "Quel est le nom du candidat ?", icon: '👤' },
    { label: '📧 Email', text: "Quel est son email ?", icon: '📧' },
    { label: '📞 Téléphone', text: "Quel est son numéro de téléphone ?", icon: '📞' },
    { label: '🛠️ Compétences', text: "Quelles sont ses compétences techniques ?", icon: '🛠️' },
    { label: '💼 Expérience', text: "Quelle est son expérience professionnelle ?", icon: '💼' }
  ];

  messages: Array<{
    type: 'user' | 'bot' | 'system';
    content: string;
    timestamp: Date;
    file?: { name: string; size: number };
  }> = [];

  constructor(private analyzerService: DocumentAnalyzerService) {
    this.messages = [{
      type: 'bot',
      content: 'Bonjour ! Je suis votre assistant RH. 📄\n\nVeuillez uploader un CV ou un document pour commencer l\'analyse.',
      timestamp: new Date()
    }];
  }

  private tryInitializeChatbot(): void {
    // Vérifier si tous les éléments sont disponibles
    if (this._fileInputRef && this._messageInputRef && this._chatMessagesRef && !this.chatbot) {
      setTimeout(() => {
        try {
          this.chatbot = new AIChatbotLogic(
            this._fileInputRef.nativeElement,
            this._messageInputRef.nativeElement,
            this._chatMessagesRef.nativeElement,
            this.analyzerService,
            this.destroy$,
            this
          );
          this.isViewInitialized = true;
          this.scrollToBottom();
          console.log('Chatbot initialisé avec succès');
        } catch (error) {
          console.error('Erreur initialisation chatbot:', error);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addUserMessage(content: string): void {
    this.messages = [...this.messages, {
      type: 'user',
      content: content,
      timestamp: new Date()
    }];
  }

  addBotMessage(content: string): void {
    this.messages = [...this.messages, {
      type: 'bot',
      content: content,
      timestamp: new Date()
    }];
  }

  addSystemMessage(content: string): void {
    this.messages = [...this.messages, {
      type: 'system',
      content: content,
      timestamp: new Date()
    }];
  }

  toggleFileUpload(): void {
    this.showFileUpload = !this.showFileUpload;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileUploaded = true;
      this.showFileUpload = false;

      this.addSystemMessage(`📎 Fichier sélectionné : ${this.selectedFile.name}`);
      setTimeout(() => {
        this.addBotMessage('Fichier reçu ! Que souhaitez-vous savoir sur ce candidat ?');
        this.scrollToBottom();
      }, 100);
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.fileUploaded = false;
    if (this._fileInputRef) {
      this._fileInputRef.nativeElement.value = '';
    }
    this.addSystemMessage('Fichier retiré');
  }

  sendQuickQuestion(question: { label: string; text: string }): void {
    if (!this.fileUploaded) {
      this.addSystemMessage('⚠️ Veuillez d\'abord uploader un fichier');
      this.scrollToBottom();
      return;
    }
    this.currentMessage = question.text;
    this.sendMessage();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
    if (!this.currentMessage.trim()) return;

    if (!this.selectedFile) {
      this.addSystemMessage('⚠️ Veuillez d\'abord sélectionner un fichier');
      this.scrollToBottom();
      return;
    }

    if (!this.chatbot) {
      this.addSystemMessage('⚠️ Initialisation du chatbot... Veuillez réessayer dans un instant.');
      setTimeout(() => this.sendMessage(), 500);
      return;
    }

    const message = this.currentMessage;
    this.addUserMessage(message);
    this.currentMessage = '';
    this.scrollToBottom();

    this.isTyping = true;

    this.chatbot.handleSubmitWithCallback(
      this.selectedFile,
      message,
      (response: string) => {
        this.isTyping = false;
        this.addBotMessage(response);
        this.scrollToBottom();
      },
      (error: string) => {
        this.isTyping = false;
        this.addSystemMessage(`❌ Erreur : ${error}`);
        this.scrollToBottom();
      }
    );
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this._chatMessagesRef) {
        try {
          const element = this._chatMessagesRef.nativeElement;
          element.scrollTop = element.scrollHeight;
        } catch (err) {
          console.error('Erreur scroll:', err);
        }
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

class AIChatbotLogic {
  private keywords = [
    'JavaScript','Python','React','Node.js','HTML','CSS','SQL','API','Docker',
    'Kubernetes','Spring Boot','Angular','MongoDB','MySQL','Microservices',
    'CI/CD','Machine Learning','Deep Learning','NLP','TypeScript','Jenkins',
    'GitHub Actions','SonarQube','Microsoft Azure','Scrum'
  ];

  constructor(
    private fileInput: HTMLInputElement,
    private textInput: HTMLInputElement,
    private messagesContainer: HTMLDivElement,
    private service: DocumentAnalyzerService,
    private destroy$: Subject<void>,
    private component: DocumentAnalyzerComponent
  ) {}

  handleSubmitWithCallback(
    file: File,
    question: string,
    onSuccess: (response: string) => void,
    onError: (error: string) => void
  ): void {
    this.service.recommend(file, question)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: RecommendResponse) => {
          const enhancedResponse = this.enhanceResponse(data.answer);
          onSuccess(enhancedResponse);
        },
        error: (err: Error) => {
          console.error('Erreur:', err);
          onError('Impossible de contacter le serveur. Vérifiez qu\'il est démarré sur http://127.0.0.1:5000');
        }
      });
  }

  private enhanceResponse(text: string): string {
    let result = text;
    this.keywords.forEach(kw => {
      const re = new RegExp(`\\b${kw}\\b`, 'gi');
      result = result.replace(re, `**${kw}**`);
    });
    return result;
  }
}
