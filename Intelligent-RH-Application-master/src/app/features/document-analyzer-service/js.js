// Classe principale pour gérer le chatbot
class AIChatbot {
  constructor() {
    this.initializeElements();
    this.attachEvents();
    this.createParticles();
    this.typingSpeed = 50;
    this.messageHistory = [];
  }

  initializeElements() {
    this.form = document.getElementById('chatForm');
    this.fileInput = document.getElementById('file');
    this.textInput = document.getElementById('text');
    this.responseContainer = document.getElementById('responses');
    this.quickButtons = document.querySelectorAll('.quick-btn');
    this.submitButton = this.form.querySelector('button[type="submit"]');
  }

  attachEvents() {
    // Événements du formulaire
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Événements des champs de saisie
    this.fileInput.addEventListener('change', () => this.handleFileSelect());
    this.textInput.addEventListener('input', () => this.handleTextInput());
    this.textInput.addEventListener('keypress', (e) => this.handleKeyPress(e));

    // Animation des boutons rapides
    this.quickButtons.forEach(btn => {
      btn.addEventListener('mouseenter', () => this.animateButton(btn));
      btn.addEventListener('click', (e) => this.handleQuickQuestion(e));
    });
  }

  createParticles() {
    // Créer un effet de particules en arrière-plan
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    particlesContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 10 + 5;
      particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: ${Math.random() * 0.3};
                animation: float ${Math.random() * 10 + 10}s linear infinite;
                transform: translateY(0);
            `;
      particlesContainer.appendChild(particle);
    }

    document.body.appendChild(particlesContainer);
  }

  animateButton(btn) {
    btn.style.transform = 'scale(1.05)';
    setTimeout(() => {
      btn.style.transform = 'scale(1)';
    }, 200);
  }

  handleQuickQuestion(event) {
    const question = event.target.getAttribute('onclick').match(/'([^']+)'/)[1];
    this.fillQuestion(question);

    // Effet de ripple
    this.createRipple(event);

    // Animation spéciale pour la question rapide
    this.textInput.style.transform = 'scale(1.02)';
    setTimeout(() => {
      this.textInput.style.transform = 'scale(1)';
    }, 200);
  }

  createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            left: ${event.clientX - rect.left - size/2}px;
            top: ${event.clientY - rect.top - size/2}px;
            pointer-events: none;
        `;

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }

  fillQuestion(question) {
    this.textInput.value = question;

    // Animation de focus améliorée
    this.textInput.focus();
    this.textInput.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.4)";
    this.textInput.style.transition = 'all 0.3s ease';

    // Effet de typing simulation
    this.simulateTyping(question);

    setTimeout(() => {
      this.textInput.style.boxShadow = "";
    }, 1500);
  }

  simulateTyping(question) {
    const originalValue = this.textInput.value;
    this.textInput.value = '';

    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < originalValue.length) {
        this.textInput.value += originalValue.charAt(i);
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 30);
  }

  handleFileSelect() {
    if (this.fileInput.files.length > 0) {
      const fileName = this.fileInput.files[0].name;
      this.showNotification(`Fichier sélectionné: ${fileName}`, 'success');

      // Animation du label
      const label = document.querySelector('label[for="file"]');
      label.style.transform = 'translateX(5px)';
      setTimeout(() => {
        label.style.transform = 'translateX(0)';
      }, 200);
    }
  }

  handleTextInput() {
    // Animation de la barre de progression de saisie
    const progress = (this.textInput.value.length / 100) * 100;
    this.textInput.style.background = `linear-gradient(to right, rgba(102, 126, 234, 0.1) ${progress}%, white ${progress}%)`;
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.form.dispatchEvent(new Event('submit'));
    }
  }

  async handleSubmit(event) {
    event.preventDefault();

    if (!this.validateForm()) return;

    this.showLoading();

    const formData = new FormData();
    formData.append("file", this.fileInput.files[0]);
    formData.append("text", this.textInput.value);

    // Sauvegarder la question dans l'historique
    this.messageHistory.push({
      type: 'question',
      content: this.textInput.value,
      timestamp: new Date()
    });

    try {
      const response = await fetch("http://127.0.0.1:5000/recommend", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      this.handleResponse(data);

    } catch (error) {
      this.handleError(error);
    }
  }

  validateForm() {
    if (this.fileInput.files.length === 0) {
      this.showNotification("Veuillez sélectionner un fichier", "error");
      this.shakeElement(this.fileInput);
      return false;
    }

    if (!this.textInput.value.trim()) {
      this.showNotification("Veuillez entrer une question", "error");
      this.shakeElement(this.textInput);
      return false;
    }

    return true;
  }

  shakeElement(element) {
    element.style.animation = 'shake 0.5s ease';
    setTimeout(() => {
      element.style.animation = '';
    }, 500);
  }

  showLoading() {
    this.responseContainer.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                <p class="loading-text">Analyse du document en cours...</p>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </div>
        `;

    // Animation de progression simulée
    let progress = 0;
    const progressFill = document.querySelector('.progress-fill');
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      if (progressFill) {
        progressFill.style.width = `${progress}%`;
      }
    }, 300);
  }

  handleResponse(data) {
    if (data.error) {
      this.showNotification(`Erreur: ${data.error}`, "error");
      this.responseContainer.innerHTML = `
                <div class="error-container">
                    <div class="error-icon">⚠️</div>
                    <p class="error-message">${data.error}</p>
                    <button class="retry-btn" onclick="location.reload()">Réessayer</button>
                </div>
            `;
      return;
    }

    // Sauvegarder la réponse dans l'historique
    this.messageHistory.push({
      type: 'response',
      content: data.answer,
      timestamp: new Date()
    });

    this.displayResponse(data);
    this.showNotification("Réponse reçue avec succès!", "success");
  }

  displayResponse(data) {
    const question = data.question;
    let answer = data.answer;

    // Formater la réponse
    if (answer.includes("\n")) {
      const items = answer.split("\n")
        .filter(item => item.trim() !== "")
        .map(item => `<li>${this.enhanceText(item.trim())}</li>`)
        .join("");
      answer = `<ul class="response-list">${items}</ul>`;
    } else {
      answer = `<p class="response-text">${this.enhanceText(answer)}</p>`;
    }

    // Ajouter des métadonnées
    const timestamp = new Date().toLocaleTimeString();

    this.responseContainer.innerHTML = `
            <div class="response-card">
                <div class="response-header">
                    <span class="response-icon">🤖</span>
                    <span class="response-time">${timestamp}</span>
                </div>
                <div class="response-body">
                    <div class="question-bubble">
                        <strong>Question :</strong> ${question}
                    </div>
                    <div class="answer-bubble">
                        <strong>Réponse :</strong> ${answer}
                    </div>
                </div>
                <div class="response-footer">
                    <button class="copy-btn" onclick="navigator.clipboard.writeText('${data.answer.replace(/'/g, "\\'")}')">
                        📋 Copier
                    </button>
                    <button class="share-btn" onclick="console.log('Partage simulé')">
                        📤 Partager
                    </button>
                </div>
            </div>
        `;

    // Animation d'entrée
    const responseCard = document.querySelector('.response-card');
    responseCard.style.animation = 'slideIn 0.5s ease';
  }

  enhanceText(text) {
    // Mettre en évidence les mots-clés techniques
    const keywords = ['JavaScript', 'Python', 'React', 'Node.js', 'HTML', 'CSS', 'SQL', 'API', 'Docker', 'Kubernetes' , 'Spring Boot' ,
      'Angular' , 'MongoDB' , 'MySQL' , 'Microservices' ,'CI/CD' , 'Machine Learning', 'Deep Leaning' , 'NLP' , 'TypeScript' , 'architectures'
      , 'Jenkins', 'Kubernetes', 'GitHub Actions', 'Netlify', 'SonarQube', 'RabbitMQ', 'Microsoft Azure' ,'Scrum '];
    let enhancedText = text;

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      enhancedText = enhancedText.replace(regex, `<span class="highlight">${keyword}</span>`);
    });

    return enhancedText;
  }

  handleError(error) {
    console.error('Erreur:', error);
    this.showNotification("Erreur de connexion au serveur", "error");

    this.responseContainer.innerHTML = `
            <div class="error-container">
                <div class="error-icon">🔌</div>
                <p class="error-message">Erreur de connexion au serveur</p>
                <p class="error-details">Vérifiez que le serveur est bien démarré sur http://127.0.0.1:5000</p>
                <button class="retry-btn" onclick="location.reload()">Réessayer</button>
            </div>
        `;
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;

    document.body.appendChild(notification);

    // Animation d'entrée
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    }, 10);

    // Disparition automatique
    setTimeout(() => {
      notification.style.transform = 'translateX(120%)';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialisation du chatbot quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  const chatbot = new AIChatbot();

  // Ajouter les animations CSS nécessaires
  const style = document.createElement('style');
  style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }

        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 12px;
            padding: 15px 20px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            transform: translateX(120%);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1000;
        }

        .notification.success {
            border-left: 4px solid #10b981;
        }

        .notification.error {
            border-left: 4px solid #ef4444;
        }

        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .loading-container {
            text-align: center;
            padding: 30px;
        }

        .loading-spinner {
            position: relative;
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
        }

        .spinner-ring {
            position: absolute;
            width: 100%;
            height: 100%;
            border: 4px solid transparent;
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        .spinner-ring:nth-child(2) {
            width: 70%;
            height: 70%;
            top: 15%;
            left: 15%;
            border-top-color: #764ba2;
            animation-duration: 1.5s;
        }

        .spinner-ring:nth-child(3) {
            width: 40%;
            height: 40%;
            top: 30%;
            left: 30%;
            border-top-color: #10b981;
            animation-duration: 2s;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .progress-bar {
            width: 100%;
            height: 6px;
            background: #e0e0e0;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 15px;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            width: 0%;
            transition: width 0.3s ease;
        }

        .loading-text {
            color: #667eea;
            font-weight: 600;
            margin: 10px 0;
        }

        .response-card {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .response-header {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .response-body {
            padding: 20px;
        }

        .question-bubble {
            background: #f0f2f5;
            padding: 15px;
            border-radius: 15px 15px 15px 5px;
            margin-bottom: 15px;
        }

        .answer-bubble {
            background: linear-gradient(135deg, #667eea10, #764ba210);
            padding: 15px;
            border-radius: 15px 15px 5px 15px;
            border-left: 4px solid #667eea;
        }

        .response-footer {
            padding: 15px;
            border-top: 1px solid #e0e0e0;
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }

        .copy-btn, .share-btn {
            padding: 8px 15px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .copy-btn {
            background: #667eea;
            color: white;
        }

        .share-btn {
            background: #10b981;
            color: white;
        }

        .copy-btn:hover, .share-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 10px rgba(0,0,0,0.2);
        }

        .highlight {
            background: linear-gradient(120deg, #667eea30, #764ba230);
            padding: 2px 5px;
            border-radius: 4px;
            font-weight: 600;
            color: #667eea;
        }

        .response-list {
            list-style: none;
            padding: 0;
        }

        .response-list li {
            padding: 8px 12px;
            margin: 5px 0;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
        }

        .response-list li:hover {
            transform: translateX(5px);
            background: linear-gradient(135deg, #667eea10, #764ba210);
        }

        .error-container {
            text-align: center;
            padding: 30px;
        }

        .error-icon {
            font-size: 48px;
            margin-bottom: 15px;
            animation: bounce 1s ease infinite;
        }

        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }

        .retry-btn {
            padding: 12px 25px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 15px;
            transition: all 0.3s ease;
        }

        .retry-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
    `;

  document.head.appendChild(style);
});
