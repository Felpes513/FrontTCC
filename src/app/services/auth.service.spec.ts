import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService, Role } from './auth.service';

class RouterStub {
  public lastUrl: string | null = null;
  navigate(commands: any[], extras?: any) {
    this.lastUrl = commands.join('/');
  }
  navigateByUrl(url: string) {
    this.lastUrl = url;
  }
}

describe('AuthService', () => {
  let service: AuthService;
  let router: RouterStub;

  beforeEach(() => {
    router = new RouterStub();
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: router }, AuthService],
    });

    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('should persist tokens and infer role', () => {
    const token =
      'header.' +
      btoa(JSON.stringify({ role: 'ALUNO' }))
        .replace(/=+$/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_') +
      '.sig';

    const role = service.setSession(token, 'refresh');
    expect(role).toBe('ALUNO');
    expect(service.getRole()).toBe('ALUNO');
  });

  it('should clear the storage on logout', () => {
    localStorage.setItem('access_token', 'a');
    service.clearSession();
    expect(localStorage.getItem('access_token')).toBeNull();
  });

  it('should redirect according to the role', () => {
    const redirects: Record<Role, string> = {
      SECRETARIA: '/secretaria/dashboard',
      ORIENTADOR: '/orientador/projetos',
      ALUNO: '/aluno/dashboard',
    };

    (Object.keys(redirects) as Role[]).forEach((role) => {
      service.redirectByRole(role);
      expect(router.lastUrl).toBe(redirects[role]);
    });
  });
});
