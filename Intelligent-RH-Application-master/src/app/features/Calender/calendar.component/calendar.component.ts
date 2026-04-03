import {Component, OnDestroy, OnInit} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { CdkDropListGroup, CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AppointmentDialogComponent } from '../appointment-dialog.component/appointment-dialog.component';
import { Appointment } from '../../../models/appointment-dialog.model';
import { CalendarService } from '../../../services/calender.service';
import { CandidatService } from '../../../services/candidat.service';
import { Subscription } from 'rxjs';

enum CalendarView {
  Month = 'month',
  Week = 'week',
  Day = 'day',
}

@Component({
  selector: 'app-candidat-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  standalone: true,
  imports: [
    CdkDropListGroup, CdkDropList, DatePipe, MatButtonToggleGroup,
    NgIf, MatButtonToggle, MatIcon, NgForOf,
    CdkDrag, MatButton, MatIconButton, RouterLink
  ],
})
export class CalendarComponent implements OnInit , OnDestroy{
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
    private candidatService: CandidatService
  ) {}

  ngOnInit() {
    this.generateTimeSlots();
    this.loadAllData();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadAllData(): void {
    const manualApps = this.calendarService.getAppointments().map(app => ({
      ...app,
      date: new Date(app.date)
    }));

    const sub = this.candidatService.getAll().subscribe({
      next: candidats => {
        const candidatApps: Appointment[] = candidats
          .filter(c => c.dateCreation)
          .map(c => ({
            id: `candidat-${c.id}`,
            uuid: `candidat-${c.id}`,
            title: `${c.nom} ${c.prenom}`,
            date: new Date(c.dateCreation as string),
            color: '#faffaa',
            description: 'Nouvelle candidature',
            startTime: c.dateCreation?.toString() || '00:00',
          }));
        this.appointments = [...manualApps, ...candidatApps];
        this.generateView(this.currentView, this.viewDate);
      },
      error: () => {
        this.appointments = manualApps;
        this.generateView(this.currentView, this.viewDate);
      }
    });

    this.subscriptions.add(sub);
  }

  protected refreshAppointments() {
    this.loadAllData();
  }

      generateTimeSlots() {
      this.timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  }

  getAppointmentsForDateTime(date: Date, timeSlot: string): Appointment[] {
    const [hours] = timeSlot.split(':').map(Number);
    return this.appointments.filter(app => this.isSameDate(app.date, date) && app.date.getHours() === hours);
  }

  generateView(view: CalendarView, date: Date) {
    this.currentView = view;
    this.viewDate = new Date(date);
    switch (view) {
      case CalendarView.Month: this.generateMonthView(date); break;
      case CalendarView.Week: this.generateWeekView(date); break;
      case CalendarView.Day: this.generateDayView(date); break;
    }
    this.updateConnectedDropLists();
  }

  generateMonthView(date: Date) {
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

  generateWeekView(date: Date) {
    const startOfWeek = this.startOfWeek(date);
    this.monthDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }

  generateDayView(date: Date) {
    this.monthDays = [new Date(date)];
  }

  previous() {
    const newDate = new Date(this.viewDate);
    switch (this.currentView) {
      case CalendarView.Month: newDate.setMonth(newDate.getMonth() - 1); break;
      case CalendarView.Week: newDate.setDate(newDate.getDate() - 7); break;
      case CalendarView.Day: newDate.setDate(newDate.getDate() - 1); break;
    }
    this.generateView(this.currentView, newDate);
  }

  next() {
    const newDate = new Date(this.viewDate);
    switch (this.currentView) {
      case CalendarView.Month: newDate.setMonth(newDate.getMonth() + 1); break;
      case CalendarView.Week: newDate.setDate(newDate.getDate() + 7); break;
      case CalendarView.Day: newDate.setDate(newDate.getDate() + 1); break;
    }
    this.generateView(this.currentView, newDate);
  }

  viewToday() {
    this.generateView(this.currentView, new Date());
  }

  startOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.viewDate.getMonth() &&
      date.getFullYear() === this.viewDate.getFullYear();
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  }

  selectDate(date: Date) {
    this.selectedDate = date;
    this.addAppointment();
  }

  getAppointmentsForDate(date: Date): Appointment[] {
    return this.appointments.filter(app => this.isSameDate(app.date, date));
  }

  drop(event: CdkDragDrop<Appointment[]>, targetDate: Date) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const movedAppointment = event.previousContainer.data[event.previousIndex];
      movedAppointment.date = new Date(targetDate);
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.calendarService.updateAppointment(event.container.data[event.currentIndex]);
    this.refreshAppointments();
  }

  addAppointment() {
    const dialogRef = this.dialog.open(AppointmentDialogComponent, {
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
        this.appointments.push(result);
        this.generateView(this.currentView, this.viewDate);
      }
    });
  }

  editAppointment(appointment: Appointment, event: Event) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(AppointmentDialogComponent, {
      width: '500px',
      data: { ...appointment }
    });

    dialogRef.afterClosed().subscribe((result: Appointment & { remove?: boolean }) => {
      if (result) {
        if (result.remove && result.uuid) this.calendarService.deleteAppointment(result.uuid);
        else this.calendarService.updateAppointment(result);
        this.refreshAppointments();
      }
    });
  }

  getRandomColor(): string {
    const hue = Math.floor(Math.random() * 360);
    return `hsla(${hue}, 70%, 50%, 0.7)`;
  }

  switchToView(view: CalendarView) {
    this.generateView(view, this.viewDate);
  }

  updateConnectedDropLists() {
    const dates = this.weeks.flat();
    this.connectedDropListsIds = dates.map(date => this.getDropListId(date));
  }

  getDropListId(date: Date): string {
    return `drop-list-${date.toDateString()}`;
  }
}
