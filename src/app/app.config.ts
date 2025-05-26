import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

// Example token.

import { AuthService } from '@infrastructure/auth/auth.service';

import { AUTH_REPOSITORY_TOKEN } from '@domain/repositories/auth/auth.repository.token';
import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { authInterceptor } from '@infrastructure/auth/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    provideHotToastConfig(),

    // Clean architecture providers.


    { provide: AUTH_REPOSITORY_TOKEN, useClass: AuthService }, provideHotToastConfig(),



  ]
};
