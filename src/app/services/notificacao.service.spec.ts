import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { NotificacaoService } from './notificacao.service';

describe('NotificacaoService', () => {
  let service: NotificacaoService;
  let http: HttpTestingController;
  let baseUrl: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NotificacaoService],
    });

    service = TestBed.inject(NotificacaoService);
    http = TestBed.inject(HttpTestingController);
    baseUrl = (service as any).baseUrl as string;
  });

  afterEach(() => {
    http.verify();
  });

  it('should map the paginated payload to the items array', () => {
    const mockItems = [{ id: 1 }, { id: 2 }];

    service.getNotificacoes('secretaria').subscribe((items) => {
      expect(items).toEqual(mockItems);
    });

    const req = http.expectOne((request) =>
      request.method === 'GET' && request.url === baseUrl
    );
    expect(req.request.params.get('destinatario')).toBe('secretaria');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('size')).toBe('1000');

    req.flush({ items: mockItems });
  });

  it('should call the paginated endpoint with custom parameters', () => {
    service
      .getNotificacoesPaginado('secretaria', 2, 5)
      .subscribe((response) => {
        expect(response.items).toEqual([]);
        expect(response.page).toBe(2);
        expect(response.size).toBe(5);
      });

    const req = http.expectOne(
      (request) =>
        request.method === 'GET' &&
        request.url === baseUrl &&
        request.params.get('page') === '2' &&
        request.params.get('size') === '5'
    );

    req.flush({ items: [], page: 2, size: 5, total: 0 });
  });

  it('should call the mark all as read endpoint', () => {
    service.marcarTodasComoLidas('secretaria').subscribe();

    const req = http.expectOne((request) =>
      request.method === 'PUT' && request.url === `${baseUrl}/mark-all`
    );

    expect(req.request.params.get('destinatario')).toBe('secretaria');
    req.flush({});
  });
});
