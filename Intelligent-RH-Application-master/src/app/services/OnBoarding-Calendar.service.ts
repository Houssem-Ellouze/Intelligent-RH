import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Appointment {
  id?: string;          // souvent généré par la base
  uuid: string;         // identifiant unique côté front
  title: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  color: string;
  description?: string;
}


@Injectable({
  providedIn: 'root'
})
export class OnBoardingCalendarService {
  private apiUrl = 'http://intelligent-rh:30222/api/onboarding/calendar';

  constructor(private http: HttpClient) { }

  getAppointments(year: number, month: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/${year}/${month}`);
  }
}
