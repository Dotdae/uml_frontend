import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthRepository } from '@domain/repositories/auth/auth.repository';
import { AUTH_REPOSITORY_TOKEN } from '@domain/repositories/auth/auth.repository.token';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService: AuthRepository = inject(AUTH_REPOSITORY_TOKEN)

  const router = inject(Router);
  let hasToken = authService.getAccessToken();


  //!NOTE: This is a workaround for the issue where the access token is not being rehydrated
  // when the app is first loaded. This is a temporary fix until the issue is resolved.
  // This will attempt to rehydrate the access token if it is not found.

  if (!hasToken) {
    console.log('No token found, attempting to rehydrate');
    await authService.rehydrateAccessToken();
  }

  const refreshedAccessToken = authService.getAccessToken();
  if (!refreshedAccessToken) {
    console.log('Rehydration failed, redirecting to sign-in...');
    router.navigate(['/auth/sign-in']);
    return false;
  }

  console.log('Access token found, allowing access to the route.');
  return true;
};
