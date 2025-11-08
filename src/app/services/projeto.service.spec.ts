import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ProjetoService } from './projeto.service';

function createBase64(content: string) {
  return `data:application/pdf;base64,${content}`;
}

describe('ProjetoService', () => {
  let service: ProjetoService;
  let http: HttpTestingController;
  let projetosUrl: string;
  let inscricoesUrl: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(ProjetoService);
    http = TestBed.inject(HttpTestingController);
    projetosUrl = (service as any).apiUrlProjetos as string;
    inscricoesUrl = (service as any).apiUrlInscricoes as string;
  });

  afterEach(() => http.verify());

  it('should require the base64 document when creating a project', (done) => {
    service
      .cadastrarProjetoCompleto(
        {
          titulo_projeto: 'Teste',
          resumo: '',
          id_campus: 1,
        } as any,
        1
      )
      .subscribe({
        error: (err) => {
          expect(err.message).toContain('Envie o documento inicial');
          done();
        },
        next: () => fail('expected error'),
      });
  });

  it('should strip the data-url prefix before sending the payload', () => {
    service
      .cadastrarProjetoCompleto(
        {
          titulo_projeto: 'Teste',
          resumo: '',
          id_campus: 1,
          ideia_inicial_b64: createBase64('ABC'),
        } as any,
        5
      )
      .subscribe();

    const req = http.expectOne(projetosUrl);
    expect(req.request.body.ideia_inicial_b64).toBe('ABC');
    req.flush({});
  });

  it('should normalise the projects list response', () => {
    service.listarProjetos().subscribe((rows) => {
      expect(rows[0]).toEqual(
        jasmine.objectContaining({ nomeProjeto: 'Projeto X', nomeOrientador: 'Fulano' })
      );
    });

    const req = http.expectOne(projetosUrl);
    req.flush({
      projetos: [
        {
          id_projeto: 10,
          titulo_projeto: 'Projeto X',
          orientador: 'Fulano',
        },
      ],
    });
  });

  it('should delete rejected enrolments when updating the approved list', () => {
    service
      .atualizarAprovadosEExcluirRejeitados(
        { id_projeto: 1, ids_alunos_aprovados: [1] },
        [
          { id_inscricao: 100, id_aluno: 1 },
          { id_inscricao: 200, id_aluno: 2 },
        ]
      )
      .subscribe((res) => {
        expect(res.excluidos).toEqual([200]);
      });

    const updateReq = http.expectOne(`${projetosUrl}update-alunos`);
    expect(updateReq.request.method).toBe('POST');
    updateReq.flush({ mensagem: 'ok' });

    const deleteReq = http.expectOne(`${inscricoesUrl}/_batch`);
    expect(deleteReq.request.method).toBe('DELETE');
    expect(deleteReq.request.body).toEqual({ ids: [200] });
    deleteReq.flush({});
  });
});
