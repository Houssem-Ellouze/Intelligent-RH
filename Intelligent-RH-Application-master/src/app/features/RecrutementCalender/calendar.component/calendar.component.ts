import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import {
  CdkDropListGroup,
  CdkDropList,
  CdkDrag,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';

import { Appointment } from '../../../models/appointment-dialog.model';
import { CalendarService } from '../../../services/calender.service';
import { RecrutementService } from '../../../services/recrutement-service';
import { Subscription } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { isToday } from 'date-fns';
import { Candidature } from '../../../models/candidature.model';
import {AppointmentDialogCalendarComponent} from '../appointment-dialog.component/appointment-dialog.component';

enum CalendarView {
  Month = 'month',
  Week = 'week',
  Day = 'day',
}

@Component({
  selector: 'app-candidature-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  standalone: true,
  imports: [
    CdkDropListGroup, CdkDropList, DatePipe, MatButtonToggleGroup,
    NgIf, MatButtonToggle, MatIcon, NgForOf,
    CdkDrag, MatButton, MatIconButton, RouterLink
  ],
})
export class CandidatureCalendarComponent implements OnInit, OnDestroy {
  viewDate: Date = new Date();
  selectedDate: Date | null = null;
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
    private calendarService: CalendarService,
    private rec: RecrutementService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.loadAllData()
    this.generateTimeSlots();
    this.generateView(this.currentView, this.viewDate);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadAllData(): void {

    // 🔹 MANUAL APPOINTMENTS (date valide uniquement)
    const manualApps: Appointment[] = this.calendarService.getAppointments()
      .filter(a => a.date)
      .map(a => ({ ...a, date: new Date(a.date!) }))
      .filter(a => !isNaN(a.date.getTime()));

    // 🔹 CANDIDATURES AVEC ENTRETIENS (filtrage dateHeure)
    const sub = this.rec.getCandidaturesByDateRdv().pipe(
      map(list => Array.isArray(list) ? list : []),
      catchError(() => of([]))
    ).subscribe(candidatures => {

      const entretienApps: Appointment[] = candidatures.flatMap(c => {

        // On filtre uniquement les entretiens qui ont une dateHeure
        if (!Array.isArray(c?.entretiens)) return [];

        return c.entretiens
          .filter(e => e?.dateHeure) // <-- filtre ici
          .map(e => {
            const dateHeure = new Date(e.dateHeure);
            if (isNaN(dateHeure.getTime())) return null;

            const uid = `entretien-${e.id}-${c.id}`;

            return {
              id: uid,
              uuid: uid,
              title: `Entretien: ${c.infos_candidat?.nom ?? 'Nom inconnu'} ${c.infos_candidat?.prenom ?? ''}`,
              date: dateHeure,
              color: '#ff9800',
              description: e.feedbackTechnique ?? 'Entretien prévu',
              startTime: dateHeure.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              endTime: ''
            } as Appointment;
          })
          .filter(Boolean) as Appointment[];
      });

      // Merge rendez-vous manuels et entretiens valides
      this.appointments = [...manualApps, ...entretienApps];
      this.cd.detectChanges();
    });

    this.subscriptions.add(sub);
  }


  refreshAppointments(): void {
    this.loadAllData()
  }

  private generateTimeSlots(): void {
    this.timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  }

  private isSameDate(date1?: Date | string, date2?: Date | string): boolean {
    if (!date1 || !date2) return false;
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  }

  getAppointmentsForDate(date: Date): Appointment[] {
    return this.appointments.filter(app => this.isSameDate(app.date, date));
  }

  getAppointmentsForDateTime(date: Date, timeSlot: string): Appointment[] {
    const [hours] = timeSlot.split(':').map(Number);
    return this.appointments.filter(app => {
      if (!app.date) return false;
      const appDate = new Date(app.date);
      return this.isSameDate(appDate, date) && appDate.getHours() === hours;
    });
  }

  private generateView(view: CalendarView, date: Date): void {
    this.currentView = view;
    this.viewDate = new Date(date);
    switch (view) {
      case CalendarView.Month:
        this.generateMonthView(date);
        break;
      case CalendarView.Week:
        this.generateWeekView(date);
        break;
      case CalendarView.Day:
        this.generateDayView(date);
        break;
    }
    this.updateConnectedDropLists();
  }

  private generateMonthView(date: Date): void {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.weeks = [];
    this.monthDays = [];

    const startDay = new Date(firstDay);
    startDay.setDate(firstDay.getDate() - firstDay.getDay());

    const endDay = new Date(lastDay);
    endDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    let currentDate = new Date(startDay);
    let week: Date[] = [];
    while (currentDate <= endDay) {
      week.push(new Date(currentDate));
      this.monthDays.push(new Date(currentDate));

      if (week.length === 7) {
        this.weeks.push(week);
        week = [];
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  private generateWeekView(date: Date): void {
    const startOfWeek = this.startOfWeek(date);
    this.monthDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }

  private generateDayView(date: Date): void {
    this.monthDays = [new Date(date)];
  }

  previous(): void {
    const newDate = new Date(this.viewDate);
    switch (this.currentView) {
      case CalendarView.Month:
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case CalendarView.Week:
        newDate.setDate(newDate.getDate() - 7);
        break;
      case CalendarView.Day:
        newDate.setDate(newDate.getDate() - 1);
        break;
    }
    this.generateView(this.currentView, newDate);
    this.loadAllData()
  }

  next(): void {
    const newDate = new Date(this.viewDate);
    switch (this.currentView) {
      case CalendarView.Month:
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case CalendarView.Week:
        newDate.setDate(newDate.getDate() + 7);
        break;
      case CalendarView.Day:
        newDate.setDate(newDate.getDate() + 1);
        break;
    }
    this.generateView(this.currentView, newDate);
    this.loadAllData()
  }

  viewToday(): void {
    this.generateView(this.currentView, new Date());
    this.loadAllData()
  }

  private startOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    this.addAppointment();
  }

  drop(event: CdkDragDrop<Appointment[]>, targetDate: Date): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const movedAppointment = { ...event.previousContainer.data[event.previousIndex] };
      movedAppointment.date = new Date(targetDate);
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      event.container.data[event.currentIndex] = movedAppointment;
      this.calendarService.updateAppointment(event.container.data[event.currentIndex]);
    }
    this.refreshAppointments();
  }

  addAppointment(): void {
    const dialogRef = this.dialog.open(AppointmentDialogCalendarComponent, {
      width: '400px',
      data: {
        date: this.selectedDate || this.viewDate,
        title: '',
        description: '',
        color: this.getRandomColor()
      },
    });

    dialogRef.afterClosed().subscribe((result: Appointment) => {
      if (result) {
        this.calendarService.addAppointment(result);
        this.refreshAppointments();
      }
    });
  }

  editAppointment(appointment: Appointment, event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(AppointmentDialogCalendarComponent, {
      width: '500px',
      data: { ...appointment }
    });

    dialogRef.afterClosed().subscribe((result: Appointment & { remove?: boolean }) => {
      if (result) {
        if (result.remove && result.uuid) {
          this.calendarService.deleteAppointment(result.uuid);
        } else {
          this.calendarService.updateAppointment(result);
        }
        this.refreshAppointments();
      }
    });
  }

  private getRandomColor(): string {
    const hue = Math.floor(Math.random() * 360);
    return `hsla(${hue}, 70%, 50%, 0.7)`;
  }

  switchToView(view: CalendarView): void {
    this.generateView(view, this.viewDate);
    this.loadAllData()
  }

  private updateConnectedDropLists(): void {
    if (this.currentView === CalendarView.Month) {
      this.connectedDropListsIds = this.monthDays.map(date => this.getDropListId(date));
    } else if (this.currentView === CalendarView.Week) {
      this.connectedDropListsIds = this.monthDays.map(date => this.getDropListId(date));
    } else {
      this.connectedDropListsIds = [this.getDropListId(this.viewDate)];
    }
  }

  protected getDropListId(date: Date): string {
    return `drop-list-${date.toDateString()}`;
  }

  protected readonly isToday = isToday;
}
