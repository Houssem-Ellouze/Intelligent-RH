import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import {Appointment} from '../models/appointment-dialog.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private readonly STORAGE_KEY = 'calendar_appointments';
  private appointments: Appointment[] = [];

  constructor() {
    this.loadAppointments();
    this.initializeSampleData();
  }

  private loadAppointments(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    this.appointments = saved ? JSON.parse(saved) : [];

    // Convertir les dates string en objets Date
    this.appointments = this.appointments.map(app => ({
      ...app,
      date: new Date(app.date),
      startTime: app.startTime || '00:00',
      endTime: app.endTime || '01:00'
    }));
  }

  private saveAppointments(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.appointments));
  }

  private initializeSampleData(): void {
    if (this.appointments.length === 0) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      // Exemple d'ajout de rendez-vous sample (optionnel)
      // const sample = this.createAppointment(today, 'Sample RDV', '09:00', '10:00');
      // this.appointments.push(sample);
      this.saveAppointments();
    }
  }

  private createAppointment(
    date: Date,
    title: string,
    startTime: string,
    endTime: string,
    color?: string
  ): Appointment {
    return {
      id: '',
      uuid: uuidv4(),
      date,
      title,
      startTime,
      endTime,
      color: color || this.generateRandomColor()};
  }

  private generateRandomColor(): string {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 50%)`;
  }

  getAppointments(): Appointment[] {
    return [...this.appointments]; // Retourne une copie
  }

  getAppointmentsForDate(date: Date): Appointment[] {
    return this.appointments.filter(app =>
      app.date.getDate() === date.getDate() &&
      app.date.getMonth() === date.getMonth() &&
      app.date.getFullYear() === date.getFullYear()
    );
  }

  addAppointment(appointment: Appointment): void {
    if (!appointment.uuid) {
      appointment.uuid = uuidv4();
    }
    if (!appointment.color) {
      appointment.color = this.generateRandomColor();
    }
    this.appointments.push(appointment);
    this.saveAppointments();
  }

  updateAppointment(updatedAppointment: Appointment): void {
    const index = this.appointments.findIndex(app => app.uuid === updatedAppointment.uuid);
    if (index !== -1) {
      this.appointments[index] = updatedAppointment;
      this.saveAppointments();
    }
  }

  deleteAppointment(uuid: string): void {
    this.appointments = this.appointments.filter(app => app.uuid !== uuid);
    this.saveAppointments();
  }
}
