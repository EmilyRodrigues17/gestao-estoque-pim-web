import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { PerfilAcesso } from '../models/perfil-acesso';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles: string[] = route.data?.['roles'] ?? [];
  const perfil = authService.perfilUsuario();

  if (perfil === PerfilAcesso.ADM || allowedRoles.includes(perfil)) {
    return true;
  }

 
  router.navigate(['/app/dashboard']);
  return false;
};
