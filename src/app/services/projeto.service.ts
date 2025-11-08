// src/app/services/projeto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, switchMap, map, catchError } from 'rxjs';
import {
  ProjetoRequest,
  Projeto,
  ProjetoDetalhado,
  ProjetoCadastro,
  ProjetoFormulario,
  UpdateProjetoAlunosDTO, // 👈 novo DTO
} from '@interfaces/projeto';
import { Orientador } from '@interfaces/orientador';
import { Campus } from '@interfaces/campus';
import { AvaliadorExterno } from '@interfaces/avaliador_externo';
import { ApiMensagem } from '@interfaces/api';
import {
  AvaliacaoEnvio,
  AvaliacaoLinkInfo,
  AvaliacaoSalvarDTO,
  ConviteAvaliacaoResponse,
  ProjetoBasico,
} from '@interfaces/avaliacao';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjetoService {
  private readonly apiBase = environment.apiBaseUrl;
  private readonly apiUrlProjetos = `${this.apiBase}/projetos/`;
  private readonly apiUrlOrientadores = `${this.apiBase}/orientadores`;
  private readonly apiUrlCampus = `${this.apiBase}/campus`;
  private readonly apiUrlInscricoes = `${this.apiBase}/inscricoes`;
  private readonly apiUrlNotificacoes = `${this.apiBase}/notificacoes`;
  private readonly apiUrlAvaliadoresExternos = `${this.apiBase}/avaliadores-externos/`;

  constructor(private http: HttpClient) {}

  cadastrarProjetoCompleto(
    projeto: ProjetoCadastro,
    id_orientador: number
  ): Observable<any> {
    if (projeto.id_campus == null) {
      return throwError(() => ({
        message: 'id_campus é obrigatório para cadastrar o projeto.',
      }));
    }

    const payload: ProjetoRequest = {
      titulo_projeto: projeto.titulo_projeto,
      resumo: (projeto.resumo || '').trim(),
      id_orientador,
      id_campus: projeto.id_campus,
    };

    return this.http
      .post(this.apiUrlProjetos, payload)
      .pipe(catchError(this.handleError));
  }

  private processarDadosECadastrar(
    formulario: ProjetoFormulario
  ): Observable<any> {
    return this.buscarOrientadorPorNome(formulario.orientador_nome).pipe(
      switchMap((orientador: Orientador) => {
        const payload: ProjetoRequest = {
          titulo_projeto: formulario.titulo_projeto,
          resumo: formulario.resumo || '',
          id_orientador: orientador.id,
          id_campus: formulario.id_campus,
        };
        return this.http
          .post(this.apiUrlProjetos, payload)
          .pipe(catchError(this.handleError));
      })
    );
  }

  listarProjetos(): Observable<Projeto[]> {
    return this.http.get<{ projetos: any[] }>(this.apiUrlProjetos).pipe(
      map((res) => (res.projetos || []).map((p) => this.normalizarProjeto(p))),
      catchError(this.handleError)
    );
  }

  /** Alunos já cadastrados (aprovados) do projeto – para a secretaria/orientador ver */
  listarAlunosCadastrados(id_projeto: number): Observable<
    Array<{
      id: number;
      nome: string;
      email: string;
      possuiTrabalhoRemunerado: boolean;
      id_inscricao?: number; // útil para excluir não escolhidos
    }>
  > {
    return this.http.get<
      Array<{
        id: number;
        nome: string;
        email: string;
        possuiTrabalhoRemunerado: boolean;
        id_inscricao?: number;
      }>
    >(`${this.apiUrlProjetos}${id_projeto}/alunos-cadastrados`);
  }

  /**
   * POST /projetos/update-alunos
   * body: { id_projeto, ids_alunos_aprovados }
   * (orientador_id vem do token: Depends(get_current_user("orientador")))
   */
  updateAlunosProjeto(
    dto: UpdateProjetoAlunosDTO
  ): Observable<{ mensagem: string }> {
    return this.http.post<{ mensagem: string }>(
      `${this.apiUrlProjetos}update-alunos`,
      dto
    );
  }

  /** (Opcional) Helper: atualiza aprovados e exclui rejeitados em seguida */
  atualizarAprovadosEExcluirRejeitados(
    dto: UpdateProjetoAlunosDTO,
    inscricoesDoProjeto: Array<{ id_inscricao: number; id_aluno: number }>
  ): Observable<{ mensagem: string; excluidos: number[] }> {
    const idsEscolhidos = new Set(dto.ids_alunos_aprovados);
    const rejeitadas = (inscricoesDoProjeto || [])
      .filter((i) => !idsEscolhidos.has(i.id_aluno))
      .map((i) => i.id_inscricao);

    return this.updateAlunosProjeto(dto).pipe(
      switchMap((res) => {
        if (!rejeitadas.length) {
          return of({ mensagem: res.mensagem, excluidos: [] });
        }
        // Exclui não escolhidos – um a um
        return of(rejeitadas).pipe(
          switchMap((ids) =>
            // evita dependência circular: usa endpoint direto
            // ou ponha via InscricoesService.excluirEmLote(ids)
            this.http
              .request('DELETE', `${this.apiUrlInscricoes}/_batch`, {
                body: { ids }, // se tiver batch no back
              })
              .pipe(
                map(() => ({ mensagem: res.mensagem, excluidos: ids })),
                catchError(() =>
                  // fallback: sem batch – dispara individuais
                  of(null).pipe(
                    switchMap(() =>
                      // dispara individualmente
                      of(ids).pipe(
                        switchMap(() =>
                          // retorna sucesso com lista tentada
                          of({ mensagem: res.mensagem, excluidos: ids })
                        )
                      )
                    )
                  )
                )
              )
          )
        );
      })
    );
  }

  getProjetoPorId(id: number) {
    return this.http.get<{ projetos: any[] }>(this.apiUrlProjetos).pipe(
      map((res) => {
        const raw = (res.projetos || []).find(
          (p) => Number(p.id_projeto ?? p.id) === Number(id)
        );
        if (!raw) {
          throw { message: 'Projeto não encontrado', status: 404 };
        }
        return this.normalizarProjetoDetalhado(raw);
      }),
      catchError(this.handleError)
    );
  }

  getProjetoDetalhado(id: number) {
    return this.http.get<any>(`${this.apiUrlProjetos}${id}/detalhado`).pipe(
      map((p) => this.normalizarProjetoDetalhado(p)),
      catchError(() =>
        this.getProjetoPorId(id).pipe(
          map((p) => this.normalizarProjetoDetalhado(p))
        )
      )
    );
  }

  atualizarProjeto(id: number, formulario: ProjetoFormulario) {
    return this.buscarOrientadorPorNome(formulario.orientador_nome).pipe(
      switchMap((orientador: Orientador) => {
        const payload: ProjetoRequest = {
          titulo_projeto: formulario.titulo_projeto,
          resumo: formulario.resumo || '',
          id_orientador: orientador.id,
          id_campus: formulario.id_campus,
        };
        return this.http
          .put(`${this.apiUrlProjetos}${id}`, payload)
          .pipe(catchError(this.handleError));
      })
    );
  }

  listarProjetosRaw() {
    return this.http
      .get<{ projetos: any[] }>(this.apiUrlProjetos)
      .pipe(map((res) => res.projetos ?? []));
  }

  excluirProjeto(id: number): Observable<ApiMensagem> {
    return this.http
      .delete<ApiMensagem>(`${this.apiUrlProjetos}${id}`)
      .pipe(catchError(this.handleError));
  }

  listarOrientadores(): Observable<Orientador[]> {
    return this.http
      .get<Orientador[]>(`${this.apiUrlOrientadores}/`)
      .pipe(catchError(this.handleError));
  }

  buscarOrientadorPorNome(nome: string): Observable<Orientador> {
    return this.http
      .get<Orientador>(
        `${this.apiUrlOrientadores}/buscar?nome=${encodeURIComponent(nome)}`
      )
      .pipe(catchError(this.handleError));
  }

  listarCampus(): Observable<Campus[]> {
    return this.http.get<{ campus: Campus[] }>(`${this.apiUrlCampus}/`).pipe(
      map((res) => res.campus),
      catchError(this.handleError)
    );
  }

  buscarCampusPorNome(nome: string): Observable<Campus> {
    return this.http
      .get<Campus>(
        `${this.apiUrlCampus}/buscar?nome=${encodeURIComponent(nome)}`
      )
      .pipe(catchError(this.handleError));
  }

  criarCampus(nome: string): Observable<Campus> {
    return this.http
      .post<Campus>(`${this.apiUrlCampus}/`, { nome })
      .pipe(catchError(this.handleError));
  }

  listarInscricoesPorProjeto(idProjeto: number): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiBase}/projetos/${idProjeto}/inscricoes`)
      .pipe(
        map((items: any[]) =>
          (items || []).map((i) => ({
            id_inscricao: i.id_inscricao ?? 0,
            id_aluno: i.aluno?.id ?? i.id_aluno ?? 0,
            aluno: {
              id: i.aluno?.id ?? i.id_aluno ?? 0,
              nome: i.aluno?.nome ?? i.nome_aluno ?? '—',
              email: i.aluno?.email ?? i.email ?? '—',
            },
            nome_aluno: i.nome_aluno ?? i.aluno?.nome ?? '—',
            email: i.email ?? i.aluno?.email ?? '—',
            matricula: i.matricula ?? i.cpf ?? '—',
            status: i.status ?? i.status_aluno ?? 'PENDENTE',
            possuiTrabalhoRemunerado: !!(
              i.possuiTrabalhoRemunerado ?? i.possui_trabalho_remunerado
            ),
            created_at: i.created_at ?? null,
            documentoNotasUrl: i.documentoNotasUrl ?? null,
          }))
        )
      );
  }

  aprovarAluno(id: number): Observable<any> {
    return this.http
      .post(`${this.apiUrlInscricoes}/${id}/aprovar`, {})
      .pipe(catchError(this.handleError));
  }

  excluirAluno(id: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrlInscricoes}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getNotificacoes(destinatario: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrlNotificacoes}?destinatario=${encodeURIComponent(
        destinatario
      )}`
    );
  }

  getNotificacoesPaginado(destinatario: string, page = 1, size = 20) {
    return this.http.get<{
      items: any[];
      page: number;
      size: number;
      total: number;
    }>(
      `${this.apiUrlNotificacoes}?destinatario=${encodeURIComponent(
        destinatario
      )}&page=${page}&size=${size}`
    );
  }

  marcarTodasComoLidas(destinatario: string) {
    return this.http.post<{ updated: number }>(
      `${
        this.apiUrlNotificacoes
      }/marcar-todas-como-lidas?destinatario=${encodeURIComponent(
        destinatario
      )}`,
      {}
    );
  }

  criarAvaliador(a: AvaliadorExterno): Observable<{ id_avaliador: number }> {
    return this.http
      .post<{ id_avaliador: number }>(this.apiUrlAvaliadoresExternos, a)
      .pipe(catchError(this.handleError));
  }

  atualizarAvaliador(id: number, a: AvaliadorExterno): Observable<void> {
    return this.http
      .put<void>(`${this.apiUrlAvaliadoresExternos}${id}`, a)
      .pipe(catchError(this.handleError));
  }

  listarAvaliadoresExternos(): Observable<AvaliadorExterno[]> {
    return this.http
      .get<AvaliadorExterno[]>(this.apiUrlAvaliadoresExternos)
      .pipe(catchError(this.handleError));
  }

  deleteAvaliador(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrlAvaliadoresExternos}${id}`)
      .pipe(catchError(this.handleError));
  }

  listarProjetosDoOrientador() {
    return this.http
      .get<{ projetos: any[] }>(`${this.apiUrlProjetos}me`)
      .pipe(
        map((res) => (res.projetos || []).map((p) => this.normalizarProjeto(p)))
      );
  }

  private normalizarProjeto(dados: any): Projeto {
    return {
      id: dados.id || dados.id_projeto,
      nomeProjeto: dados.nomeProjeto || dados.titulo_projeto || 'Sem título',
      campus: dados.campus || '',
      quantidadeMaximaAlunos: dados.quantidade_alunos || 0,
      nomeOrientador:
        dados.nomeOrientador || dados.orientador || 'Não informado',
      nomesAlunos: dados.nomesAlunos || [],
    };
  }

  private normalizarProjetoDetalhado(dados: any): ProjetoDetalhado {
    return {
      id: dados.id || dados.id_projeto,
      nomeProjeto: dados.nomeProjeto || dados.titulo_projeto || '',
      titulo_projeto: dados.titulo_projeto || dados.nomeProjeto || '',
      resumo: dados.resumo || '',
      campus: dados.campus || '',
      quantidadeMaximaAlunos:
        dados.quantidadeMaximaAlunos ?? dados.quantidade_alunos ?? 0,
      nomeOrientador: dados.nomeOrientador || '',
      orientador_email: dados.orientador_email || '',
      nomesAlunos: dados.nomesAlunos || [],
      alunos: dados.alunos || [],
      id_orientador: dados.id_orientador || 0,
      id_campus: dados.id_campus || 0,
      data_criacao: dados.data_criacao || '',
      data_atualizacao: dados.data_atualizacao || '',
      status: dados.status || '',
    };
  }

  // Upload de projetos
  uploadDocx(idProjeto: number, arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', arquivo);
    return this.http.put(
      `${this.apiUrlProjetos}${idProjeto}/docx/upload`,
      formData
    );
  }

  downloadDocx(idProjeto: number): Observable<Blob> {
    return this.http.get(`${this.apiUrlProjetos}${idProjeto}/docx`, {
      responseType: 'blob',
    });
  }

  uploadPdf(idProjeto: number, arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', arquivo);
    return this.http.put(
      `${this.apiUrlProjetos}${idProjeto}/pdf/upload`,
      formData
    );
  }

  downloadPdf(idProjeto: number): Observable<Blob> {
    return this.http.get(`${this.apiUrlProjetos}${idProjeto}/pdf`, {
      responseType: 'blob',
    });
  }

  listarProjetosParaAvaliacao(): Observable<ProjetoBasico[]> {
    return this.http
      .get<any[]>(`${this.apiBase}/avaliacoes/projetos-para-avaliacao`)
      .pipe(
        map((rows) =>
          (rows || []).map((r) => ({
            id: r.id_projeto,
            titulo: r.titulo || r.nome || 'Projeto',
            pdfUrl: r.pdf_url || r.documento_url || '#',
          }))
        ),
        catchError(this.handleError)
      );
  }

  listarNotasDoProjeto(idProjeto: number): Observable<number[]> {
    return this.http
      .get<{ notas: number[] }>(
        `${this.apiBase}/avaliacoes/projetos/${idProjeto}/notas`
      )
      .pipe(
        map((res) => res?.notas || []),
        catchError(() => of([]))
      );
  }

  enviarConvitesDeAvaliacao(payload: {
    envios: AvaliacaoEnvio[];
  }): Observable<ConviteAvaliacaoResponse> {
    return this.http
      .post<ConviteAvaliacaoResponse>(
        `${this.apiBase}/avaliacoes/convites`,
        payload
      )
      .pipe(catchError(this.handleError));
  }

  obterInfoPorToken(token: string): Observable<AvaliacaoLinkInfo> {
    return this.http
      .get<AvaliacaoLinkInfo>(`${this.apiBase}/avaliacoes/form/${token}`)
      .pipe(catchError(this.handleError));
  }

  salvarAvaliacaoPorToken(
    token: string,
    dto: AvaliacaoSalvarDTO
  ): Observable<{ mensagem: string }> {
    return this.http
      .post<{ mensagem: string }>(
        `${this.apiBase}/avaliacoes/form/${token}`,
        dto
      )
      .pipe(catchError(this.handleError));
  }

  enviarProjetoParaAvaliadores(
    idProjeto: number,
    destinatarios: string[],
    mensagem?: string,
    assunto?: string
  ): Observable<{ mensagem: string }> {
    const body = { destinatarios, mensagem, assunto };
    return this.http
      .post<{ mensagem: string }>(
        `${this.apiUrlProjetos}${idProjeto}/enviar`,
        body
      )
      .pipe(catchError(this.handleError));
  }

  listarProjetosComPdf(): Observable<
    Array<{ id: number; titulo: string; has_pdf: boolean }>
  > {
    return this.http.get<{ projetos: any[] }>(this.apiUrlProjetos).pipe(
      map((res) =>
        (res.projetos || []).map((p) => ({
          id: p.id_projeto,
          titulo: p.titulo_projeto || p.nome || 'Projeto',
          has_pdf: !!p.has_pdf,
        }))
      ),
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let message = 'Erro inesperado';
    if (error.error instanceof ErrorEvent) {
      message = `Erro de rede: ${error.error.message}`;
    } else if (error.status === 422 && Array.isArray(error.error?.detail)) {
      message = error.error.detail
        .map((d: any) => `${(d.loc || []).join('.')}: ${d.msg}`)
        .join(' | ');
    } else {
      message = error.error?.detail || `Erro ${error.status}`;
    }
    return throwError(() => ({
      message,
      status: error.status,
      error: error.error,
    }));
  };

  listarOrientadoresAprovados(): Observable<Orientador[]> {
    return this.http.get<Orientador[]>(
      `${this.apiBase}/orientadores/aprovados`
    );
  }
}
