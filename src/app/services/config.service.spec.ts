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

  // 🔁 Substitui o antigo teste de reset por um teste da nova API:
  it('should delete curso', () => {
    service.excluirCurso(123).subscribe();
    const req = http.expectOne(`${base}/cursos/123`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ ok: true });
  });
});
