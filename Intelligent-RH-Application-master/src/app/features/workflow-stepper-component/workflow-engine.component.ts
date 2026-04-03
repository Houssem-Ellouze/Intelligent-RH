import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PostulationComponent} from '../postulation-component/postulation-component';
import {StatutManagerComponent} from '../statut-manager-component/statut-manager-component';
import {EntretienPlanifComponent} from '../entretien-planif-component/entretien-planif-component';
import {ToastComponent} from '../toast-component/toast-component';
import {NotificationsService} from '../../services/notifications.service';


@Component({
  selector: 'app-workflow-engine',
  standalone: true,
  imports: [CommonModule, PostulationComponent, StatutManagerComponent, EntretienPlanifComponent],
  templateUrl: './workflow-engine.component.html',
  styleUrls: ['./workflow-engine.component.scss']
})
export class WorkflowEngineComponent implements OnInit {

  private notif = inject(NotificationsService);

  statutActuel: string = 'NOUVELLE';
  currentStep: number = 1;
  candidatureId: number | null = null;

  ngOnInit() {}

  onPostulationSuccess(id: number) {
    this.candidatureId = id;
    this.currentStep = 2;
  }

  handlePostulationSuccess(id: number) {
    this.candidatureId = id;
    this.currentStep = 2;
    this.notif.success('Postulation enregistrée avec succès.');
  }

  onStatutUpdated(nouveauStatut: string) {
    this.statutActuel = nouveauStatut;

    if (nouveauStatut === 'ENTRETIEN_EN_COURS') {
      this.currentStep = 3;
      this.notif.info('Entretien planifié — passage à l\'étape suivante.');
    } else if (nouveauStatut === 'OFFRE_EMISE') {
      this.currentStep = 4;
      this.notif.info('Offre émise — passage à la décision finale.');
    } else if (nouveauStatut === 'ACCEPTEE') {
      this.currentStep = 4;
      this.notif.success('Candidature acceptée !');
    } else if (nouveauStatut === 'REFUSEE') {
      this.notif.warning('Candidature refusée.');
    }
  }

  goToStep(step: number) {
    if (this.candidatureId) {
      this.currentStep = step;
    } else {
      this.notif.warning('Veuillez d\'abord soumettre une postulation.');
    }
  }
}
