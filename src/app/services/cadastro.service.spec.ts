import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { RegisterService } from './cadastro.service';

describe('RegisterService', () => {
  let service: RegisterService;
  let http: HttpTestingController;
  let base: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(RegisterService);
    http = TestBed.inject(HttpTestingController);
    base = (service as any).baseUrl as string;
  });

  afterEach(() => http.verify());

  it('should register orientadores using cleaned CPF', () => {
    service
      .registerOrientador({
        nomeCompleto: 'Nome',
        cpf: '123.456.789-00',
        email: 'a@a.com',
        senha: '123456',
      })
      .subscribe();

    const req = http.expectOne(`${base}/orientadores/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.cpf).toBe('12345678900');
    req.flush({});
  });

  it('should evaluate password strength', () => {
    const weak = service.validatePasswordStrength('abc');
    expect(weak.isValid).toBeFalse();
    expect(weak.feedback.length).toBeGreaterThan(0);

    const strong = service.validatePasswordStrength('Abcdef1!');
    expect(strong.isValid).toBeTrue();
    expect(strong.score).toBeGreaterThanOrEqual(3);
  });
});
