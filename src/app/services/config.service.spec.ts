import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;
  let http: HttpTestingController;
  let base: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(ConfigService);
    http = TestBed.inject(HttpTestingController);
    base = (service as any).apiUrl as string;
  });

  afterEach(() => http.verify());

  it('should list campus', () => {
    service.listarCampus().subscribe((res) => {
      expect(res.campus.length).toBe(1);
    });

    const req = http.expectOne(`${base}/campus`);
    expect(req.request.method).toBe('GET');
    req.flush({ campus: [{}] });
  });

  it('should call reset password direct endpoint', () => {
    service
      .resetPasswordDirect({
        perfil: 'aluno',
        email: 'a@a.com',
        cpf: '123',
        nova_senha: '123456',
      })
      .subscribe();

    const req = http.expectOne(`${base}/reset-password-direct`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      perfil: 'aluno',
      email: 'a@a.com',
      cpf: '123',
      nova_senha: '123456',
    });
    req.flush({ message: 'ok' });
  });
});
