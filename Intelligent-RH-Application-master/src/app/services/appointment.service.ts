import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../models/appointment-dialog.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private baseUrl = 'http://intelligent-rh:30222/appointments';

  constructor(private http: HttpClient) {}

  // Récupérer tous les rendez-vous
  getAllAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/all`);
  }

  // Créer un rendez-vous
  createAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(this.baseUrl, appointment);
  }

  // Modifier un rendez-vous
  updateAppointment(appointment: Appointment): Observable<Appointment> {
    if (!appointment.id) {
      // erreur ou throw
      throw new Error("ID manquant");
    }
    return this.http.put<Appointment>(`${this.baseUrl}/${appointment.id}`, appointment);
  }


  // Supprimer un rendez-vous
  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

}
