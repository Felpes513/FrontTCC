import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SidenavSecretariaComponent } from './sidenav-secretaria.component';
import { AuthService, Role } from '@services/auth.service';
import { ProjetoService } from '@services/projeto.service';
import { Router } from '@angular/router';

class AuthServiceStub {
  role: Role | null = 'SECRETARIA';
  getRole = jasmine.createSpy().and.callFake(() => this.role);
  hasRole = jasmine.createSpy().and.callFake((role: Role) => this.role === role);
  hasAnyRole = jasmine.createSpy().and.returnValue(true);
  clearSession = jasmine.createSpy('clearSession');
}

class ProjetoServiceStub {
  getNotificacoesPaginado = jasmine.createSpy().and.returnValue(of({ items: [], page: 1, size: 10, total: 0 }));
  getNotificacoes = jasmine.createSpy().and.returnValue(of([]));
  marcarTodasComoLidas = jasmine.createSpy().and.returnValue(of({}));
}

class RouterStub {
  navigate = jasmine.createSpy('navigate');
}

describe('SidenavSecretariaComponent', () => {
  let component: SidenavSecretariaComponent;
  let projetoService: ProjetoServiceStub;
  let auth: AuthServiceStub;

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidenavSecretariaComponent],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: ProjetoService, useClass: ProjetoServiceStub },
        { provide: Router, useClass: RouterStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SidenavSecretariaComponent);
    component = fixture.componentInstance;
    projetoService = TestBed.inject(ProjetoService) as unknown as ProjetoServiceStub;
    auth = TestBed.inject(AuthService) as unknown as AuthServiceStub;
  });

  it('should expose the readable role name', () => {
    expect(component.papelLegivel()).toBe('Secretaria');
    auth.role = 'ORIENTADOR';
    expect(component.papelLegivel()).toBe('Orientador');
  });

  it('should toggle the mobile menu only when on mobile', () => {
    component.isMobile = false;
    component.isMenuOpen = true;
    component.toggleMenu();
    expect(component.isMenuOpen).toBeTrue();

    component.isMobile = true;
    component.toggleMenu();
    expect(component.isMenuOpen).toBeFalse();
  });

  it('should clear the session when the user confirms logout', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.confirmarSaida(new Event('click'));
    expect(auth.clearSession).toHaveBeenCalled();
  });

  it('should mark notifications as read for the secretaria', () => {
    component.isSecretaria = true;
    component.marcarNotificacoesComoLidas();
    expect(projetoService.marcarTodasComoLidas).toHaveBeenCalledWith('secretaria');
  });
});
