import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup} from '@angular/cdk/drag-drop';
import { Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AppointmentDialogComponent } from '../appointment-dialog.component/appointment-dialog.component';
import { Appointment } from '../../../models/appointment-dialog.model';
import { CalendarService } from '../../../services/calender.service';
import { CandidatService } from '../../../services/candidat.service';
import { OnboardingService } from '../../../services/onboarding.service';
import { RecrutementService } from '../../../services/recrutement-service';
import { Collaborateur } from '../../../models/onboarding.model';
import {RouterLink} from '@angular/router';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';


enum CalendarView {
  Month = 'month',
  Week = 'week',
  Day = 'day',
}

@Component({
  selector: 'global-calendar',
  templateUrl: './global.calendar.component.html',
  styleUrls: ['./global.calendar.component.scss'],
  imports: [
    RouterLink,
    CdkDropListGroup,
    DatePipe,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatIconButton,
    MatIcon,
    MatButton,
    CdkDropList,
    NgForOf,
    NgIf,
    CdkDrag
  ],
  standalone: true
})
export class GlobalCalendarComponent implements OnInit, OnDestroy {

  viewDate: Date = new Date();
  selectedDate: Date | null = null;

  currentView: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;

  weeks: Date[][] = [];
  monthDays: Date[] = [];
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  timeSlots: string[] = [];

  appointments: Appointment[] = [];
  connectedDropListsIds: string[] = [];

  private subscriptions = new Subscription();

  constructor(
    private dialog: MatDialog,
    private calendarService: CalendarService,
    private candidatService: CandidatService,
    private onboardingService: OnboardingService,
    private recrutementService: RecrutementService,
    private cd: ChangeDetectorRef
  ) {}

  // ================= INIT / DESTROY =================
  ngOnInit(): void {
    this.generateTimeSlots();
    this.refreshAppointments();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ================= HEADER ACTIONS =================
  switchToView(view: CalendarView): void {
    this.generateView(view, this.viewDate);
  }

  previous(): void {
    const d = new Date(this.viewDate);
    if (this.currentView === CalendarView.Month) d.setMonth(d.getMonth() - 1);
    if (this.currentView === CalendarView.Week) d.setDate(d.getDate() - 7);
    if (this.currentView === CalendarView.Day) d.setDate(d.getDate() - 1);
    this.generateView(this.currentView, d);
  }

  next(): void {
    const d = new Date(this.viewDate);
    if (this.currentView === CalendarView.Month) d.setMonth(d.getMonth() + 1);
    if (this.currentView === CalendarView.Week) d.setDate(d.getDate() + 7);
    if (this.currentView === CalendarView.Day) d.setDate(d.getDate() + 1);
    this.generateView(this.currentView, d);
  }

  viewToday(): void {
    this.generateView(this.currentView, new Date());
  }

  addAppointment(): void {
    this.dialog.open(AppointmentDialogComponent);
  }

  editAppointment(app: Appointment, event: MouseEvent): void {
    event.stopPropagation();
    this.dialog.open(AppointmentDialogComponent, { data: app });
  }

  // ================= DATA LOADING =================
  refreshAppointments(): void {
    this.appointments = [];

    this.loadAllData();
    this.loadOnBoardingAllData();
    this.loadAllCandidateursData();

    setTimeout(() => {
      this.generateView(this.currentView, this.viewDate);
      this.cd.detectChanges();
    });
  }

  loadAllData(): void {
    const manualApps = this.calendarService.getAppointments()
      .filter(a => a.date)
      .map(a => ({ ...a, date: new Date(a.date!) }))
      .filter(a => !isNaN(a.date.getTime()));

    const sub = this.candidatService.getAll().subscribe({
      next: candidats => {
        const candidatApps = candidats
          .filter(c => c.dateCreation)
          .map(c => ({
            id: `Workflow-Talent :candidat-${c.id}`,
            uuid: `Workflow-Talent :candidat-${c.id}`,
            title: `${c.nom} ${c.prenom}`,
            date: new Date(c.dateCreation!),
            startTime: '',
            endTime: '',
            color: '#faffaa',
            description: 'Nouvelle candidature'
          }))
          .filter(a => !isNaN(a.date.getTime()));

        this.appointments.push(...manualApps, ...candidatApps);
      },
      error: () => this.appointments.push(...manualApps)
    });

    this.subscriptions.add(sub);
  }

  loadAllCandidateursData(): void {
    const sub = this.recrutementService.getCandidaturesByDateRdv()
      .pipe(catchError(() => of([])))
      .subscribe(candidatures => {

        const entretienApps = candidatures.flatMap(c =>
          (c.entretiens ?? [])
            .filter(e => e?.dateHeure)
            .map(e => {
              const d = new Date(e.dateHeure);
              if (isNaN(d.getTime())) return null;

              return {
                id: `Workflow-Recrutement : entretien-${e.id}`,
                uuid: `Workflow-Recrutement :entretien-${e.id}`,
                title: `Workflow-Recrutement :Entretien: ${c.infos_candidat?.nom ??  'Inconnu'} ${c.infos_candidat?.prenom ??  'Inconnu'}` ,
                date: d,
                startTime: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                endTime: '',
                color: '#ff9800',
                description: e.feedbackTechnique ?? 'Workflow-Recrutement :Entretien'
              } as Appointment;
            })
            .filter((a): a is Appointment => a !== null)
        );

        this.appointments.push(...entretienApps);
      });

    this.subscriptions.add(sub);
  }

  loadOnBoardingAllData(): void {
    const sub = this.onboardingService.getAllCollaborateurs()
      .pipe(catchError(() => of([])))
      .subscribe((collabs: Collaborateur[]) => {

        const onboardingApps = collabs
          .filter(c => c.contrat?.dateDebut)
          .map(c => ({
            uuid: `Workflow-OnBoarding-collab-${c.id}`,
            title: `${c.nom} ${c.prenom}`,
            date: new Date(c.contrat!.dateDebut),
            startTime: c.statutOnboarding,
            endTime: '',
            color: '#72d219',
            description: 'Onboarding'
          }))
          .filter(a => !isNaN(a.date.getTime()));

        this.appointments.push(...onboardingApps);
      });

    this.subscriptions.add(sub);
  }

  // ================= VIEW GENERATION =================
  generateTimeSlots(): void {
    this.timeSlots = Array.from({ length: 24 }, (_, i) =>
      `${i.toString().padStart(2, '0')}:00`
    );
  }

  generateView(view: CalendarView, date: Date): void {
    this.currentView = view;
    this.viewDate = new Date(date);

    if (view === CalendarView.Month) this.generateMonthView(date);
    if (view === CalendarView.Week) this.generateWeekView(date);
    if (view === CalendarView.Day) this.generateDayView(date);

    this.updateConnectedDropLists();
  }

  generateMonthView(date: Date): void {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    this.weeks = [];
    let cur = new Date(first);
    cur.setDate(cur.getDate() - cur.getDay());

    while (cur <= last || cur.getDay() !== 0) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
      this.weeks.push(week);
    }
  }

  generateWeekView(date: Date): void {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    this.monthDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }

  generateDayView(date: Date): void {
    this.monthDays = [new Date(date)];
  }

  // ================= HELPERS USED IN HTML =================
  getAppointmentsForDate(date: Date): Appointment[] {
    return this.appointments.filter(a =>
      a.date.toDateString() === date.toDateString()
    );
  }

  getAppointmentsForDateTime(date: Date, time: string): Appointment[] {
    return this.appointments.filter(a =>
      a.date.toDateString() === date.toDateString() &&
      a.startTime === time
    );
  }

  isToday(date: Date): boolean {
    return date.toDateString() === new Date().toDateString();
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.viewDate.getMonth();
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
  }

  drop(event: CdkDragDrop<Appointment[]>, date: Date): void {
    if (!event.item?.data) return;
    event.item.data.date = new Date(date);
  }

  updateConnectedDropLists(): void {
    this.connectedDropListsIds = this.monthDays.map(d =>
      `drop-${d.toDateString()}`
    );
  }
}
