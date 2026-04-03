import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RhPredictionService {
  private apiUrl = 'http://intelligent-rh:30500'; // URL de ton serveur Flask

  constructor(private http: HttpClient) {}

  uploadCv(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('cv', file, file.name);
    return this.http.post(`${this.apiUrl}/predict_cv`, formData);
  }
}
