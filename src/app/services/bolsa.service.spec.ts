import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { BolsaService } from './bolsa.service';

describe('BolsaService', () => {
  let service: BolsaService;
  let http: HttpTestingController;
  let base: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(BolsaService);
    http = TestBed.inject(HttpTestingController);
    base = (service as any).base as string;
  });

  afterEach(() => {
    http.verify();
  });

  it('should list bolsas', () => {
    const mock = [{ id_aluno: 1, nome_completo: 'Aluno', email: '', possui_bolsa: true }];

    service.listar().subscribe((rows) => {
      expect(rows).toEqual(mock);
    });

    const req = http.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('should create bolsa', () => {
    service.create(1, true).subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = http.expectOne(`${base}/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ id_aluno: 1, possui_bolsa: true });
    req.flush({ id_aluno: 1, possui_bolsa: true });
  });

  it('should update the bolsa status', () => {
    service.setStatus(1, true).subscribe((res) => {
      expect(res).toEqual({ id_aluno: 1, possui_bolsa: true });
    });

    const req = http.expectOne(`${base}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ possui_bolsa: true });
    req.flush({ id_aluno: 1, possui_bolsa: true });
  });
});
