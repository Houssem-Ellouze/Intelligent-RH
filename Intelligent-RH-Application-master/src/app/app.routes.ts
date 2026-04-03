import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard';
import { CandidatFormComponent } from './features/candidat-form/candidat-form';
import {OffreListComponent} from './features/offre-list-component/offre-list-component';
import {PostulationComponent} from './features/postulation-component/postulation-component';
import {DossierListComponent} from './features/dossier-list-component/dossier-list-component';
import {OffreCreateComponent} from './features/offre-create-component/offre-create-component';
import {StatutManagerComponent} from './features/statut-manager-component/statut-manager-component';
import {EntretienPlanifComponent} from './features/entretien-planif-component/entretien-planif-component';
import {WorkflowEngineComponent} from './features/workflow-stepper-component/workflow-engine.component';
import {OnboardingListComponent} from './features/onboarding-list.component/onboarding-list.component';
import {MasterOnboardingComponent} from './features/master-onboarding.component/master-onboarding.component';
import {CalendarComponent} from './features/Calender/calendar.component/calendar.component';
import {CandidatureStatsComponent} from './features/candidature-stats/candidature-stats';
import {CollaborateurStatsComponent} from './features/collaborateur-stats/collaborateur-stats';
import {GlobalStatsComponent} from './features/global-stats/global-stats';
import {GlobalCalendarComponent} from './features/GlobalCalender/calendar.component/global.calendar.component';
import {
  OnBoardingCalendarComponent
} from './features/OnBoardingCalendar/calendar.component/onBoarding-calender.component';
import {CandidatureCalendarComponent} from './features/RecrutementCalender/calendar.component/calendar.component';
import {CompareTalentsComponent} from './features/compare-talents-component/compare-talents-component';
import {ProfileScoreComponent} from './features/profile-score/profile-score';
import {ProfileUploadComponent} from './features/profile-upload-component/profile-upload-component';
import {RankingComponent} from './features/ranking-component/ranking-component';
import {TalentSearchComponent} from './features/talent-search-component/talent-search-component';
import {UpdateCvComponent} from './features/update-cv-component/update-cv-component';
import {CandidatStatsComponent} from './features/talent-stats/talent-stats';
import {LoginComponent} from './auth/login/login';
import {RegisterComponent} from './auth/register/register';
import {Logout} from './auth/logout/logout';
import {ActivateAccountComponent} from './auth/activate-account/activate-account';
import {ResetPassword} from './auth/reset-password/reset-password';
import {ResetPasswordRequest} from './auth/reset-password-request/reset-password-request';
import {LandingComponent} from './features/landing-page/landing-page';
import {RhDashboardComponent} from './features/rh-dashboard-component/rh-dashboard-component';
import {GestionsComponent} from './features/client-dashboard-component/client-dashboard-component';
import {NavMenuComponent} from './features/sidebar-component/sidebar-component';
import {CltDashboardComponent} from './features/clt-dashboard/clt-dashboard';
import {OnboardingCltComponent} from './features/onboarding-clt.component/onboarding-clt.component';
import {OffreClt} from './features/offre-clt-component/offre-list-component';
import {ScoutingComponent} from './features/scouting-component/scouting-component';
import {ClientFormComponent} from './features/client-form/client-form';
import {MainViewComponent} from './features/main-view-component/main-view-component';
import {DocumentAnalyzerComponent} from './features/document-analyzer-service/document-analyzer-service';
import {RhPredictionComponent} from './features/rh-prediction/rh-prediction';
import {ProfileComponent} from './features/profile-component/profile-component';
import {HRNotificationPanelComponent} from './features/hrnotification-panel/hrnotification-panel';
import {HRNotificationBellComponent} from './features/hrnotification-bell-component/hrnotification-bell-component';

export const routes: Routes = [
  //CRUD CANDIDAT
  { path: 'dashboard', component: DashboardComponent },
  { path: 'candidat/nouveau', component: CandidatFormComponent }, // Route Ajout
  { path: 'candidat/modifier/:id', component: CandidatFormComponent }, // Route Modif avec ID
  { path: 'client/modifier/:id', component: ClientFormComponent }, // Route Modif avec ID
  { path: 'postulation', component: PostulationComponent }, // Route Modif avec ID
  { path: 'offres', component: OffreListComponent }, // Route Modif avec ID /master-onboarding
  { path: 'dossiers', component: DossierListComponent }, // Route Modif avec ID creer-offre  workflow-engine OnboardingListComponent
  { path: 'creer-offre', component: OffreCreateComponent },
  { path: 'status', component: StatutManagerComponent },
  { path: 'entretien', component: EntretienPlanifComponent },
  { path: 'workflow-engine', component: WorkflowEngineComponent },
  { path: 'OnBoarding-list', component: OnboardingListComponent },
  { path: 'master-onboarding', component: MasterOnboardingComponent },
  { path: 'candidature-stats', component: CandidatureStatsComponent },
  { path: 'collaborateur-stats', component: CollaborateurStatsComponent },
  { path: 'all-stats', component: GlobalStatsComponent },
  { path: 'candidat-stats', component: CandidatStatsComponent },
  { path: 'global-calendar', component: GlobalCalendarComponent },
  { path: 'onBoarding-candidature-calendar', component: OnBoardingCalendarComponent },
  { path: 'candidature-calendar', component: CandidatureCalendarComponent},
  { path: 'candidat-calendar', component: CalendarComponent },
  { path: 'compare-talent', component: CompareTalentsComponent },
  { path: 'profile-score' , component: ProfileScoreComponent },
  { path: 'profile-upload' , component: ProfileUploadComponent },
  { path: 'ranking' , component: RankingComponent},
  { path: 'talent-search' , component: TalentSearchComponent},
  { path: 'status-manager' , component: StatutManagerComponent},
  { path: 'update-cv' , component: UpdateCvComponent},
  { path: 'login' , component: LoginComponent},
  { path: 'register' , component: RegisterComponent},
  { path: 'logout' , component: Logout},
  { path: 'activate-account' , component: ActivateAccountComponent},
  { path: 'reset-password' , component: ResetPassword},
  { path: 'activate-account' , component: ActivateAccountComponent},
  { path: 'reset-password-request' , component: ResetPasswordRequest},
  { path: 'rh-dashboard' , component: RhDashboardComponent},
  { path: 'client-dashboard' , component: GestionsComponent},
  { path: 'scouting', component: NavMenuComponent},
  { path: 'clt-client', component: CltDashboardComponent},
  { path: 'clt-offre', component: OffreClt},
  { path: 'clt-onboarding', component: OnboardingCltComponent},
  { path: 'clt-scouting', component: ScoutingComponent},
  { path: 'kanban-board', component: MainViewComponent},
  { path: 'rh-prediction', component: RhPredictionComponent},
  { path: 'profile', component: ProfileComponent},
  { path: 'notif-panel', component: HRNotificationPanelComponent},
  { path: 'notif-bell', component: HRNotificationBellComponent},






  { path: '', component: LandingComponent }  //Authentification LandingPage CltDashboardComponent OffreCltComponent OnboardingCltComponent



];
