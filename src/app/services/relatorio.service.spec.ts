import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { RelatorioService } from './relatorio.service';

describe('RelatorioService', () => {
  let service: RelatorioService;
  let http: HttpTestingController;
  let base: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(RelatorioService);
    http = TestBed.inject(HttpTestingController);
    base = (service as any).apiBase as string;
  });

  afterEach(() => http.verify());

  it('should map the orientador reports', () => {
    service.listarDoMes('2024-01').subscribe((rows) => {
      expect(rows[0]).toEqual(
        jasmine.objectContaining({
          id: 1,
          projetoId: 2,
          referenciaMes: '2024-01',
        })
      );
    });

    const req = http.expectOne(
      (request) =>
        request.url === `${base}/me/relatorios-mensais` &&
        request.params.get('mes') === '2024-01'
    );
    req.flush([{ id_relatorio: 1, id_projeto: 2, mes: '2024-01' }]);
  });

  it('should confirm a report', () => {
    service.confirmar(5, { mes: '2024-01', ok: true, observacao: '' }).subscribe();

    const req = http.expectOne(`${base}/5/relatorios-mensais/confirmar`);
    expect(req.request.method).toBe('POST');
    req.flush({ id_relatorio: 10, mensagem: 'ok' });
  });
});
