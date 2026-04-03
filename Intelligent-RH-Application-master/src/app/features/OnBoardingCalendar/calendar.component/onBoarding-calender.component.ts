import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CdkDropListGroup, CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { OnBoardingAppointmentDialogComponent } from '../appointment-dialog.component/appointment-dialog.component';
import { OnboardingService } from '../../../services/onboarding.service';
import { Collaborateur } from '../../../models/onboarding.model';
import { AppointmentService } from '../../../services/appointment.service';
import { Subscription } from 'rxjs';
import { isToday } from 'date-fns';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {Appointment} from '../../../models/appointment-dialog.model';
import { OnBoardingCalendarService } from '../../../services/OnBoarding-Calendar.service';
import {MatIcon} from '@angular/material/icon';
enum CalendarView {
  Month = 'month',
  Week = 'week',
  Day = 'day',
}

@Component({
  selector: 'onBoarding-candidature-calendar',
  templateUrl: './onBoarding-calender.component.html',
  styleUrls: ['./onBoarding-calender.component.scss'],
  standalone: true,
  imports: [CdkDropListGroup, CdkDropList, CdkDrag, DatePipe, MatIconButton, MatButton, MatButtonToggle, MatButtonToggleGroup, RouterLink, MatIcon, NgForOf, NgIf],
})
export class OnBoardingCalendarComponent implements OnInit, OnDestroy {
  viewDate: Date = new Date();
  currentView: CalendarView = CalendarView.Month;
  monthDays: Date[] = [];
  weeks: Date[][] = [];
  appointments: Appointment[] = [];
  timeSlots: string[] = [];
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  public CalendarView = CalendarView;
  connectedDropListsIds: string[] = [];
  private subscriptions: Subscription = new Subscription();

  constructor(
    public dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private onBoardingCalendarService: OnBoardingCalendarService,
    private onBoardingService: OnboardingService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.generateTimeSlots();
    this.generateView(this.currentView, this.viewDate);
    this.loadAllData();
  }

  ngOnDestroy(): void { this.subscriptions.unsubscribe(); }


  loadAllData(): void {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth() + 1;

    // =========================
    // RDV manuels (backend)
    // =========================
    const manualApps$ = this.onBoardingCalendarService
      .getAppointments(year, month)
      .pipe(
        map(apps =>
          apps.map(app => ({
            ...app,
            date: new Date(app.date)
          }))
        ),
        catchError(() => of([] as Appointment[]))
      );

    // =========================
    // Collaborateurs → événements calendrier
    // FILTRÉS PAR contrat.dateDebut
    // =========================
    const collaborateurs$ = this.onBoardingService
      .getAllCollaborateurs()
      .pipe(
        map(collabs =>
          collabs
            .filter(c => {
              if (!c.contrat?.dateDebut) return false;

              const d = new Date(c.contrat.dateDebut);
              return d.getFullYear() === year && d.getMonth() + 1 === month;
            })
            .map((c: Collaborateur): Appointment => ({
              uuid: `collaborateur-${c.id}`,
              title: `${c.nom} ${c.prenom}`,
              date: new Date(c.contrat!.dateDebut),
              startTime: `${c.statutOnboarding}`,
              color: '#72d219',
              description: 'Period essai'
            }))
        ),
        catchError(() => of([] as Appointment[]))
      );

    // =========================
    // Fusion des deux sources
    // =========================
    const sub = forkJoin([manualApps$, collaborateurs$]).subscribe({
      next: ([manualApps, collabApps]) => {
        this.appointments = [...manualApps, ...collabApps];
      },
      error: () => {
        this.appointments = [];
      }
    });

    this.subscriptions.add(sub);
  }

  refreshAppointments(): void { this.loadAllData(); }

  private generateTimeSlots(): void {
    this.timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2,'0')}:00`);
  }

  private isSameDate(date1?: Date | string, date2?: Date | string): boolean {
    if (!date1 || !date2) return false;
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  }

  getAppointmentsForDate(date: Date): Appointment[] {
    return this.appointments.filter(app => app.date && this.isSameDate(app.date, date));
  }

  getAppointmentsForDateTime(date: Date, timeSlot: string): Appointment[] {
    const [hours] = timeSlot.split(':').map(Number);
    return this.appointments.filter(app => app.date && this.isSameDate(app.date, date) && new Date(app.date).getHours() === hours);
  }

  private generateView(view: CalendarView, date: Date): void {
    this.currentView = view;
    this.viewDate = new Date(date);
    switch(view) {
      case CalendarView.Month: this.generateMonthView(date); break;
      case CalendarView.Week: this.generateWeekView(date); break;
      case CalendarView.Day: this.generateDayView(date); break;
    }
    this.updateConnectedDropLists();
  }

  private generateMonthView(date: Date): void {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.weeks = [];
    this.monthDays = [];
    const startDay = new Date(firstDay); startDay.setDate(firstDay.getDate() - firstDay.getDay());
    const endDay = new Date(lastDay); endDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    let currentDate = new Date(startDay); let week: Date[] = [];
    while(currentDate <= endDay) {
      week.push(new Date(currentDate));
      this.monthDays.push(new Date(currentDate));
      if(week.length === 7) { this.weeks.push(week); week = []; }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  private generateWeekView(date: Date): void {
    const startOfWeek = this.startOfWeek(date);
    this.monthDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek); d.setDate(startOfWeek.getDate() + i); return d;
    });
  }

  private generateDayView(date: Date): void { this.monthDays = [new Date(date)]; }

  previous(): void { this.changeDate(-1); }
  next(): void { this.changeDate(1); }

  private changeDate(delta: number): void {
    const newDate = new Date(this.viewDate);
    switch(this.currentView) {
      case CalendarView.Month: newDate.setMonth(newDate.getMonth() + delta); break;
      case CalendarView.Week: newDate.setDate(newDate.getDate() + 7 * delta); break;
      case CalendarView.Day: newDate.setDate(newDate.getDate() + delta); break;
    }
    this.generateView(this.currentView, newDate);
    this.loadAllData();
  }

  viewToday(): void { this.generateView(this.currentView, new Date()); this.loadAllData(); }

  private startOfWeek(date: Date): Date {
    const d = new Date(date); return new Date(d.setDate(d.getDate() - d.getDay()));
  }

  selectDate(date: Date): void { this.addAppointment(date); }

  drop(event: CdkDragDrop<Appointment[]>, targetDate: Date): void {
    if(event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const moved = {...event.previousContainer.data[event.previousIndex], date: targetDate};
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      event.container.data[event.currentIndex] = moved;
      this.appointmentService.updateAppointment?.(moved);
    }
    this.refreshAppointments();
  }

  addAppointment(date?: Date): void {
    const selected = date || this.viewDate;
    const dialogRef = this.dialog.open(OnBoardingAppointmentDialogComponent, {
      width: '400px',
      data: { date: selected, title: '', description: '', color: this.getRandomColor() }
    });
  }

  editAppointment(app: Appointment, event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(OnBoardingAppointmentDialogComponent, { width:'500px', data: {...app} });
    dialogRef.afterClosed().subscribe((result: Appointment & { remove?: boolean }) => {
      if(result) {
        if(result.remove && result.uuid) this.appointmentService.deleteAppointment?.(result.uuid);
        else this.appointmentService.updateAppointment?.(result);
        this.refreshAppointments();
      }
    });
  }

  private getRandomColor(): string { return `hsla(${Math.floor(Math.random() * 360)},70%,50%,0.7)`; }

  switchToView(view: CalendarView): void { this.generateView(view, this.viewDate); this.loadAllData(); }

  private updateConnectedDropLists(): void { this.connectedDropListsIds = this.monthDays.map(date => this.getDropListId(date)); }

  protected getDropListId(date: Date): string { return `drop-list-${date.toDateString()}`; }

  protected readonly isToday = isToday;
}
