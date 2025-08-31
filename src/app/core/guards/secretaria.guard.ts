import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@services/auth.service';

export const secretariaGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const router = inject(Router);
  const auth = inject(AuthService);
  if (auth.isLoggedIn() && auth.hasRole('SECRETARIA')) return true;
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
