import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideNativeDateAdapter } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()), // Permet de récupérer l'ID du candidat facilement
    provideHttpClient(),
    provideCharts(withDefaultRegisterables()), // Nécessaire pour le radar chart de l'image,
    provideNativeDateAdapter()

  ]
};
