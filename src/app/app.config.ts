import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';

// Example token.

import { USER_REPOSITORY_TOKEN } from '@domain/repositories/user/user.repository.token';
import { UserRepositoryImplementation } from '@infrastructure/user/user.repository.implementation';
import { AuthService } from '@infrastructure/auth/auth.service';

import { AUTH_REPOSITORY_TOKEN } from '@domain/repositories/auth/auth.repository.token';
import { provideHotToastConfig } from '@ngxpert/hot-toast';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()), provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),

    // Clean architecture providers.
    { provide: USER_REPOSITORY_TOKEN, useClass: UserRepositoryImplementation },


    { provide: AUTH_REPOSITORY_TOKEN, useClass: AuthService }, provideHotToastConfig(),

  ]
};
