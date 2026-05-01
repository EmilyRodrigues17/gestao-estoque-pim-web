import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, catchError, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getAccessToken()) {
    return true;
  }

  // 2. Se tem refresh token salvo → tenta renovar antes de bloquear
  if (authService.hasSavedRefreshToken()) {
    return authService.refresh().pipe(
      map(() => true),
      catchError(() => {
        authService.clearSession();
        router.navigate(['/login']);
        return of(false);
      })
    );
  }

  // 3. Sem nenhum token → login
  router.navigate(['/login']);
  return false;
};
