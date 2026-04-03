import {Component, ViewChild, ElementRef, AfterViewInit, EventEmitter, Output, Input} from '@angular/core';
import * as QRCode from 'qrcode';
import { OnboardingService } from '../../services/onboarding.service';
import { NgIf } from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-signature-qr',
  templateUrl: './signature-qr-component.html',
  styleUrls: ['./signature-qr-component.css'],
  imports: [NgIf],
  standalone: true
})
export class SignatureQrComponent implements AfterViewInit {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  @Output() signatureSaved = new EventEmitter<string>();
  @Output() goNext = new EventEmitter<void>();
  @Output() qrGenerated = new EventEmitter<any>();


  signatureBase64!: string;
  qrImg = '';
  qrUrl = ''; // URL complète vers le QR pour le scanner depuis un autre appareil

  constructor(private service: OnboardingService , private router:Router) {}

  ngAfterViewInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';

    let drawing = false;
    const canvas = this.canvas.nativeElement;

    canvas.addEventListener('mousedown', () => drawing = true);
    canvas.addEventListener('mouseup', () => {
      drawing = false;
      this.ctx.beginPath(); // reset path
    });

    canvas.addEventListener('mousemove', (e: MouseEvent) => {
      if (!drawing) return;
      const rect = canvas.getBoundingClientRect();
      this.ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    });
  }

  saveSignature() {
    this.signatureBase64 = this.canvas.nativeElement.toDataURL('image/png');

    this.service.saveSignature(1, this.signatureBase64).subscribe({
      next: (res: any) => {
        console.log('Signature sauvegardée :', res);
      },
      error: (err) => console.error('Erreur sauvegarde signature :', err)
    });
    this.signatureSaved.emit(this.signatureBase64);

  }

  generateQR() {
    if (!this.signatureBase64) {
      return;
    }

    // Upload la signature pour obtenir le filePath du QR sur le backend
    this.service.uploadQR(this.signatureBase64).subscribe({
      next: (res: any) => {
        if (!res?.filePath) {
          console.error('Aucun filePath renvoyé par le backend');
          return;
        }

        // Transforme le chemin Windows en URL complète
        const filePath = res.filePath.replace(/\\/g, '/');
        this.qrUrl = `http://intelligent-rh:8222/${filePath}`;

        // Génère le QR Code avec l’URL complète
        const canvasQR = document.createElement('canvas');
        QRCode.toCanvas(canvasQR, this.qrUrl, { width: 200 })
          .then(() => {
            this.qrImg = canvasQR.toDataURL('image/png');
            console.log('QR Code généré !');
          })
          .catch(err => console.error('Erreur génération QR :', err));
      },
      error: (err) => console.error('Erreur upload QR :', err)
    });
  }



  finishAndProceed() {
    // Vérifier qu'on a bien une signature
    const signatureData = this.getSignatureData();

    if (signatureData) {
      // Émettre les deux événements
      // @ts-ignore
      this.signatureSaved.emit(this.signatureSaved);

      // Si un QR code a été généré, l'émettre aussi
      if (this.qrImg) {
        this.qrGenerated.emit({
          qrImage: this.qrImg,
          qrUrl: this.qrUrl
        });
      }

      // Petit délai pour l'UX
      setTimeout(() => {
        this.triggerNextStep();
      }, 1000);
    } else {
      this.showError('Veuillez d\'abord créer une signature');
    }
  }
  // 5. Fonction pour déclencher le passage à l'étape suivante
  triggerNextStep() {
    console.log('Émission de goNext vers le parent');
    this.goNext.emit();
  }

  // 6. Fonction utilitaire pour obtenir les données de signature
  private getSignatureData() {
    // Votre logique pour extraire la signature du canvas
    return {
      imageData: 'data:image/png;base64,...',
      timestamp: new Date(),
      size: '400x200'
    };
  }

  // 7. Afficher un message de succès
  private showSuccess(message: string) {
    // Vous pouvez utiliser un toast ou console
    console.log('✅', message);
  }

  // 8. Afficher une erreur
  private showError(message: string) {
    console.error('❌', message);
    // Optionnel : afficher une alerte
    alert(message);
  }
  nextStep() {
    this.goNext.emit();
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.signatureBase64 = '';
    this.qrImg = '';
    this.qrUrl = '';
  }


}
