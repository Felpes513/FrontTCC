import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { LoginService } from './login.service';

describe('LoginService', () => {
  let service: LoginService;
  let http: HttpTestingController;
  let base: string;

  function buildToken(payload: Record<string, unknown>): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      .replace(/=+$/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const body = btoa(JSON.stringify(payload))
      .replace(/=+$/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    return `${header}.${body}.signature`;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(LoginService);
    http = TestBed.inject(HttpTestingController);
    base = (service as any).baseUrl as string;
    localStorage.clear();
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('should authenticate alunos with form encoded body', () => {
    service.loginAluno('user@mail.com', '123456').subscribe();

    const req = http.expectOne(`${base}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe('username=user%40mail.com&password=123456');
    expect(req.request.headers.get('Content-Type')).toBe(
      'application/x-www-form-urlencoded'
    );

    const token = buildToken({ role: 'ALUNO' });
    req.flush({ access_token: token, refresh_token: 'ref' });

    expect(localStorage.getItem('access_token')).toBe(token);
    expect(localStorage.getItem('refresh_token')).toBe('ref');
    expect(localStorage.getItem('role')).toBe('ALUNO');
  });

  it('should throw if the backend omits the access token', () => {
    expect(() =>
      (service as any).persistTokensFromResponse({ refresh_token: 'x' })
    ).toThrowError('Resposta de login sem access_token');
  });

  it('should decode the role from arbitrary payload keys', () => {
    const token = buildToken({ authorities: ['secretaria'] });
    service.setTokens(token, '');
    expect(service.getRole()).toBe('SECRETARIA');
  });
});
