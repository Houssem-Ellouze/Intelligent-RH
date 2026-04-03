import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthenticationRequest } from '../models/authentication-request.model';
import { AuthenticationResponse } from '../models/authentication-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `http://intelligent-rh:30222/auth`;

  constructor(private http: HttpClient) {}

  register(registerRequest: any) {
    return this.http.post<any>('http://intelligent-rh/auth/register', registerRequest);
  }

  authenticate(request: AuthenticationRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${this.apiUrl}/authenticate`, request)
      .pipe(
        tap((response: AuthenticationResponse) => {
          console.log('Response du serveur:', response);

          // Sauvegarder le token (access_token au lieu de token)
          if (response?.access_token) {
            localStorage.setItem('token', response.access_token);
            console.log('✅ Token sauvegardé');

            // Décoder le JWT pour extraire les authorities/rôles
            const decodedToken = this.decodeToken(response.access_token);
            console.log('Token décodé:', decodedToken);

            // Extraire le rôle depuis les authorities
            const role = this.extractRoleFromAuthorities(decodedToken?.authorities);
            console.log('❌ RÔLE FINAL EXTRAIT:', role);

            if (role) {
              localStorage.setItem('userRole', role);
            }
          }
        })
      );
  }

  // Décoder le JWT
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }
  }

  // Extraire le rôle depuis les authorities
  private extractRoleFromAuthorities(authorities: string[] | undefined): string {
    if (!authorities || authorities.length === 0) {
      return 'CLIENT'; // Valeur par défaut
    }

    // Chercher les rôles parmi les authorities
    // Les rôles sont au format ROLE_RH, ROLE_CLIENT, etc.
    for (const authority of authorities) {
      if (authority.includes('ROLE_RH')) {
        return 'RH';
      } else if (authority.includes('ROLE_MANAGER')) {
        return 'MANAGER';
      } else if (authority.includes('ROLE_CLIENT')) {
        return 'CLIENT';
      } else if (authority.includes('ROLE_SUPER_ADMIN')) {
        return 'SUPER_ADMIN';
      }
    }

    return 'CLIENT'; // Valeur par défaut
  }

  activateAccount(token: string): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/activate?token=${token}`);
  }

  logout(): Observable<any> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post('http://intelligent-rh:30222/auth/logout', {}, { headers }).pipe(
      tap(() => {
        // Nettoyer le localStorage après logout
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        console.log('Logout réussi');
      })
    );
  }

  // Nouvelle méthode pour récupérer le rôle
  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Récupérer le token
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
