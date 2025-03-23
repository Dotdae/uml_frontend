
import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthRepository } from '@domain/repositories/auth/auth.repository';
import { AUTH_REPOSITORY_TOKEN } from '@domain/repositories/auth/auth.repository.token';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const authService: AuthRepository = inject(AUTH_REPOSITORY_TOKEN)
  const accessToken = authService.getAccessToken();

  // If there is an access token, add it to the request headers
  const authReq = accessToken
    ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    : req;

  //!NOTE: This is a workaround for the issue where the access token is not being rehydrated
  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        return authService.refreshAccessToken().pipe(
          switchMap((success) => {
            if (success) {
              const newAccessToken = authService.getAccessToken();
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newAccessToken}`,
                },
              });
              return next(retryReq);
            } else {
              console.log('Refresh token failed, logging out');
              authService.logout();
              return throwError(() => error);
            }
          })
        );
      }
      return throwError(() => error);
    })
  );
};
