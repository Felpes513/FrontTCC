import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { InscricoesService } from './inscricoes.service';

describe('InscricoesService', () => {
  let service: InscricoesService;
  let http: HttpTestingController;
  let base: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(InscricoesService);
    http = TestBed.inject(HttpTestingController);
    base = (service as any).baseUrl as string;
  });

  afterEach(() => http.verify());

  it('should enrol a student into a project', () => {
    service.inscrever(10).subscribe((res) => {
      expect(res.success).toBeTrue();
    });

    const req = http.expectOne(`${base}/inscricao/inscrever`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ id_projeto: 10 });
    req.flush({ success: true, message: 'ok' });
  });

  it('should list approved students for a project', () => {
    service.listarAprovadosDoProjeto(5).subscribe((rows) => {
      expect(rows).toEqual([{ id_aluno: 1 }]);
    });

    const req = http.expectOne(`${base}/projetos/5/alunos`);
    req.flush({ alunos: [{ id_aluno: 1 }] });
  });

  it('should upload transcripts', () => {
    const blob = new Blob(['nota'], { type: 'application/pdf' });
    const file = new File([blob], 'notas.pdf');

    service.uploadDocumento(1, file).subscribe();

    const req = http.expectOne(`${base}/inscricoes/1/documento-notas`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush({});
  });
});
