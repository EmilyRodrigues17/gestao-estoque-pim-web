import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (req.url.includes('/login') || req.url.includes('/refresh')) {
    return next(req);
  }


  const token = authService.getAccessToken();
  let reqComToken = req;
  if (token) {
    reqComToken = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(reqComToken).pipe(
    catchError((error: HttpErrorResponse) => {
      // Se 401 e tem refresh token → tentar renovar
      if (error.status === 401 && authService.getRefreshToken()) {
        return authService.refresh().pipe(
          switchMap((res) => {
            // Reenvia a requisição original com novo token
            const novaReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.accessToken}` },
            });
            return next(novaReq);
          }),
          catchError(() => {
            // Se refresh falhou → logout
            authService.logout();
            return throwError(() => error);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
