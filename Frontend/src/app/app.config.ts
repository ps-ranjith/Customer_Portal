// src/app/app.config.ts

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router'; // Important: Import provideRouter
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes'; // <-- This is where your routes are imported

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // <-- This provides the router with your defined routes
    provideHttpClient(withInterceptorsFromDi()) // <-- This provides HTTP client for API calls
  ]
};