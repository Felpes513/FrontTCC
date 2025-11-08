import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '@services/auth.service';

@Injectable({ providedIn: 'root' })
export class LandingRedirectGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): true | UrlTree {
    const role = this.auth.getRole?.();
    if (!role) return true;

    const target =
      role === 'SECRETARIA'
        ? '/secretaria/dashboard'
        : role === 'ORIENTADOR'
        ? '/orientador/projetos'
        : role === 'ALUNO'
        ? '/aluno/projetos'
        : '/login';

    return this.router.parseUrl(target);
  }
}
