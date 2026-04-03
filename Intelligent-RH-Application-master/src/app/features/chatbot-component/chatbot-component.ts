import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Observable } from 'rxjs';
import {ChatbotService, Message} from '../../services/chatbot.service';
import {FormsModule} from '@angular/forms';
import {AsyncPipe, DatePipe, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot-component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf,
    DatePipe,
    AsyncPipe
  ],
  styleUrls: ['./chatbot-component.scss']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages$: Observable<Message[]>;
  inputMessage: string = '';
  isLoading: boolean = false;
  isOpen: boolean = false;
  unreadCount: number = 0;

  constructor(private chatbotService: ChatbotService) {
    this.messages$ = this.chatbotService.messages$;
  }

  ngOnInit(): void {
    this.messages$.subscribe(messages => {
      // Compter les nouveaux messages du bot quand le chat est fermé
      if (!this.isOpen && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.sender === 'bot') {
          this.unreadCount++;
        }
      }
      this.scrollToBottom();
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (this.inputMessage.trim().length === 0) return;

    this.chatbotService.sendMessage(this.inputMessage);
    this.inputMessage = '';
    this.isLoading = true;

    // Simuler le chargement
    setTimeout(() => {
      this.isLoading = false;
    }, 1500);
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.unreadCount = 0;
    }
  }

  resetChat(): void {
    this.chatbotService.reset();
    this.unreadCount = 0;
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clickSuggestion(action: string): void {
    this.chatbotService.handleSuggestion(action);
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      // Ignorer les erreurs de scroll
    }
  }
}
