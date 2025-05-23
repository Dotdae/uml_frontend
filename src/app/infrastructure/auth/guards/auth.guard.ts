import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthRepository } from '@domain/repositories/auth/auth.repository';
import { AUTH_REPOSITORY_TOKEN } from '@domain/repositories/auth/auth.repository.token';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService: AuthRepository = inject(AUTH_REPOSITORY_TOKEN)
  const router = inject(Router);
  
  // First check if we already have a token
  const hasToken = authService.getAccessToken();
  
  // Only attempt rehydration if we're not already on the sign-in page
  // and we don't have a token
  if (!hasToken && !state.url.includes('/auth/sign-in')) {
    try {
      await authService.rehydrateAccessToken();
      const refreshedToken = authService.getAccessToken();
      
      if (!refreshedToken) {
        router.navigate(['/auth/sign-in']);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Auth guard rehydration failed:', error);
      router.navigate(['/auth/sign-in']);
      return false;
    }
  }

  // If we have a token, allow access
  if (hasToken) {
    return true;
  }

  // If we get here, we have no token and rehydration wasn't attempted
  router.navigate(['/auth/sign-in']);
  return false;
};
