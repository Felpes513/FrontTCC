// projeto.service.ts
// ============================================================================
// Serviço central para operações de Projetos, Orientadores, Campus, Inscrições
// e Avaliadores Externos.
// ============================================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError, switchMap } from 'rxjs/operators';

// ============================================================================
// Interfaces (DTOs) trocadas entre Front e Back
// ============================================================================

/** Payload mínimo aceito pelo backend ao criar/atualizar projeto */
export interface ProjetoRequest {
  titulo_projeto: string;
  resumo: string;
  id_orientador: number;
  id_campus: number;
}

/** Entidade de projeto utilizada na listagem básica do frontend */
export interface Projeto {
  id: number;
  nomeProjeto: string;
  campus: string;
  /** Representa a quantidade atual de alunos no projeto (mapeado do backend) */
  quantidadeMaximaAlunos: number;
  nomeOrientador: string;
  nomesAlunos: string[];
  status?: 'EM_EXECUCAO' | 'CONCLUIDO';
}

/** Formulário interno usado para montar o ProjetoRequest */
interface ProjetoFormulario {
  titulo_projeto: string;
  resumo?: string;
  orientador_nome: string;
  id_campus: number;
}

/** Dados do formulário de criação completa de projeto */
export interface ProjetoCadastro {
  titulo_projeto: string;
  resumo: string;
  orientador_nome: string;
  orientador_email: string;
  id_campus: number;
  quantidadeMaximaAlunos: number;
}

/** Representa um aluno relacionado ao projeto */
export interface Aluno {
  id?: number;
  nome: string;
  email: string;
  ra?: string;
  curso?: string;
  telefone?: string;
  documentoNotasUrl?: string;
}

/** Detalhes completos do projeto (tela de detalhes) */
export interface ProjetoDetalhado {
  id: number;
  nomeProjeto: string;
  titulo_projeto: string;
  resumo?: string;
  campus: string;
  quantidadeMaximaAlunos: number;
  nomeOrientador: string;
  orientador_email?: string;
  nomesAlunos: string[];
  alunos?: Aluno[];
  id_orientador: number;
  id_campus: number;
  data_criacao?: string;
  data_atualizacao?: string;
  status?: string;
}

/** Orientador */
export interface Orientador {
  id: number;
  nome_completo: string;
  email?: string;
}

/** Campus */
export interface Campus {
  id_campus: number;
  campus: string;
}

/** Avaliador Externo */
export interface AvaliadorExterno {
  id?: number;
  nome: string;
  email: string;
  especialidade: string;
  subespecialidade: string;
  link_lattes: string;
}

// ============================================================================
// Serviço
// ============================================================================

@Injectable({ providedIn: 'root' })
export class ProjetoService {
  // ❗️Sugestão: mova estas URLs para environment.ts (ex.: environment.apiBaseUrl)
  private readonly apiUrlProjetos = 'http://localhost:8001/projetos';
  private readonly apiUrlOrientadores = 'http://localhost:8001/orientadores';
  private readonly apiUrlCampus = 'http://localhost:8001/campus';
  private readonly apiUrlInscricoes = 'http://localhost:8001/inscricoes';
  private readonly apiUrlNotificacoes = 'http://localhost:8001/notificacoes';
  private readonly apiUrlAvaliadoresExternos =
    'http://localhost:8001/avaliadores-externos';

  constructor(private http: HttpClient) {}

  // ==========================================================================
  // PROJETOS
  // ==========================================================================

  /**
   * Cria um novo projeto a partir do formulário completo.
   * Faz validações mínimas e mapeia para o DTO aceito pelo backend.
   */
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
      resumo: projeto.resumo.trim(),
      id_orientador,
      id_campus: projeto.id_campus,
    };

    return this.http.post(this.apiUrlProjetos, payload).pipe(
      tap((response) => console.log('✅ Projeto cadastrado:', response)),
      catchError(this.handleError)
    );
  }

  /**
   * Converte dados do formulário (com nome do orientador) para o payload aceito pelo backend
   * e executa o POST de criação do projeto.
   */
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

        return this.http.post(this.apiUrlProjetos, payload).pipe(
          tap((response) => console.log('✅ Projeto cadastrado:', response)),
          catchError(this.handleError)
        );
      })
    );
  }

  /** Lista projetos (visão resumida) */
  listarProjetos(): Observable<Projeto[]> {
    return this.http.get<any[]>(this.apiUrlProjetos).pipe(
      map((projetos) => projetos.map((p: any) => this.normalizarProjeto(p))),
      catchError(this.handleError)
    );
  }

  /** Busca um projeto por id (payload cru do backend) */
  getProjetoPorId(id: number): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrlProjetos}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /** Busca detalhes do projeto e normaliza; fallback para GET /:id se rota /detalhado não existir */
  getProjetoDetalhado(id: number): Observable<ProjetoDetalhado> {
    return this.http.get<any>(`${this.apiUrlProjetos}/${id}/detalhado`).pipe(
      map((projeto) => this.normalizarProjetoDetalhado(projeto)),
      catchError(() =>
        this.getProjetoPorId(id).pipe(
          map((projeto) => this.normalizarProjetoDetalhado(projeto))
        )
      )
    );
  }

  /** Atualiza um projeto mapeando nome do orientador → id_orientador */
  atualizarProjeto(id: number, formulario: ProjetoFormulario): Observable<any> {
    return this.buscarOrientadorPorNome(formulario.orientador_nome).pipe(
      switchMap((orientador: Orientador) => {
        const payload: ProjetoRequest = {
          titulo_projeto: formulario.titulo_projeto,
          resumo: formulario.resumo || '',
          id_orientador: orientador.id,
          id_campus: formulario.id_campus,
        };

        return this.http
          .put(`${this.apiUrlProjetos}/${id}`, payload)
          .pipe(catchError(this.handleError));
      })
    );
  }

  /** Exclui um projeto pelo id */
  excluirProjeto(id: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrlProjetos}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // ==========================================================================
  // ORIENTADORES
  // ==========================================================================

  /** Lista orientadores */
  listarOrientadores(): Observable<Orientador[]> {
    return this.http
      .get<Orientador[]>(`${this.apiUrlOrientadores}/`)
      .pipe(catchError(this.handleError));
  }

  /** Busca orientador por nome (usado para mapear nome → id) */
  buscarOrientadorPorNome(nome: string): Observable<Orientador> {
    return this.http
      .get<Orientador>(
        `${this.apiUrlOrientadores}/buscar?nome=${encodeURIComponent(nome)}`
      )
      .pipe(catchError(this.handleError));
  }

  // ==========================================================================
  // CAMPUS
  // ==========================================================================

  /** Lista todos os campus */
  listarCampus(): Observable<Campus[]> {
    return this.http
      .get<Campus[]>(`${this.apiUrlCampus}/`)
      .pipe(catchError(this.handleError));
  }

  /** Busca campus por nome */
  buscarCampusPorNome(nome: string): Observable<Campus> {
    return this.http
      .get<Campus>(
        `${this.apiUrlCampus}/buscar?nome=${encodeURIComponent(nome)}`
      )
      .pipe(catchError(this.handleError));
  }

  /** Cria um novo campus */
  criarCampus(nome: string): Observable<Campus> {
    return this.http
      .post<Campus>(`${this.apiUrlCampus}/`, { campus: nome })
      .pipe(catchError(this.handleError));
  }

  // ==========================================================================
  // INSCRIÇÕES / ALUNOS
  // ==========================================================================

  /** Lista inscrições de um projeto específico */
  listarInscricoesPorProjeto(idProjeto: number): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrlInscricoes}/projetos/${idProjeto}/inscricoes`)
      .pipe(catchError(this.handleError));
  }

  /** Aprova um aluno por id de inscrição */
  aprovarAluno(id: number): Observable<any> {
    return this.http
      .post(`${this.apiUrlInscricoes}/${id}/aprovar`, {})
      .pipe(catchError(this.handleError));
  }

  /** Exclui uma inscrição de aluno */
  excluirAluno(id: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrlInscricoes}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // ==========================================================================
  // NOTIFICAÇÕES
  // ==========================================================================

  /** Busca notificações por destinatário (email ou outro identificador) */
  getNotificacoes(destinatario: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrlNotificacoes}?destinatario=${encodeURIComponent(
        destinatario
      )}`
    );
  }

  // --- NOTIFICAÇÕES PAGINADAS ---
  getNotificacoesPaginado(destinatario: string, page = 1, size = 20) {
    const url = `http://localhost:8001/notificacoes?destinatario=${encodeURIComponent(
      destinatario
    )}&page=${page}&size=${size}`;
    return this.http.get<{
      items: any[];
      page: number;
      size: number;
      total: number;
    }>(url);
  }

  // --- MARCAR TODAS COMO LIDAS (não apaga nada) ---
  marcarTodasComoLidas(destinatario: string) {
    const url = `http://localhost:8001/notificacoes/marcar-todas-como-lidas?destinatario=${encodeURIComponent(
      destinatario
    )}`;
    return this.http.post<{ updated: number }>(url, {});
  }

  // ==========================================================================
  // AVALIADORES EXTERNOS
  // ==========================================================================

  /** Cria um Avaliador Externo */
  criarAvaliador(avaliador: AvaliadorExterno): Observable<any> {
    return this.http.post(this.apiUrlAvaliadoresExternos, avaliador).pipe(
      tap(() => console.log('✅ Avaliador criado')),
      catchError(this.handleError)
    );
  }

  /** Atualiza um Avaliador Externo */
  atualizarAvaliador(id: number, avaliador: AvaliadorExterno): Observable<any> {
    return this.http
      .put(`${this.apiUrlAvaliadoresExternos}/${id}`, avaliador)
      .pipe(
        tap(() => console.log('✅ Avaliador atualizado')),
        catchError(this.handleError)
      );
  }

  /** Lista Avaliadores Externos */
  listarAvaliadoresExternos(): Observable<AvaliadorExterno[]> {
    return this.http
      .get<AvaliadorExterno[]>(this.apiUrlAvaliadoresExternos)
      .pipe(catchError(this.handleError));
  }

  deleteAvaliador(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrlAvaliadoresExternos}/${id}`).pipe(
      tap(() => console.log('🗑️ Avaliador deletado')),
      catchError(this.handleError)
    );
  }

  // ==========================================================================
  // AÇÕES DO ORIENTADOR
  // ==========================================================================

  /**
   * Atualiza a lista de alunos associados a um projeto
   * (depende de um endpoint específico do backend).
   */
  updateAlunosProjeto(
    id_projeto: number,
    id_alunos: number[]
  ): Observable<any> {
    const body = { id_projeto, id_alunos };
    return this.http.post(`${this.apiUrlProjetos}/update-alunos`, body).pipe(
      tap((res) => console.log('✅ Alunos atualizados com sucesso:', res)),
      catchError(this.handleError)
    );
  }

  // ==========================================================================
  // NORMALIZAÇÃO (mapeia payloads do backend para o formato usado no front)
  // ==========================================================================

  /** Normaliza um projeto para a listagem simples */
  private normalizarProjeto(dados: any): Projeto {
    return {
      id: dados.id || dados.id_projeto,
      nomeProjeto: dados.nomeProjeto || dados.titulo_projeto || 'Sem título',
      campus: dados.campus || '',
      // ❗ Atenção: backend envia `quantidade_alunos`? Se o correto for `quantidadeMaximaAlunos`,
      // alinhar com a API para evitar confusão.
      quantidadeMaximaAlunos: dados.quantidade_alunos || 0,
      nomeOrientador:
        dados.nomeOrientador || dados.orientador || 'Não informado',
      nomesAlunos: dados.nomesAlunos || [],
    };
  }

  /** Normaliza um projeto para a visão detalhada */
  private normalizarProjetoDetalhado(dados: any): ProjetoDetalhado {
    return {
      id: dados.id || dados.id_projeto,
      nomeProjeto: dados.nomeProjeto || dados.titulo_projeto || '',
      titulo_projeto: dados.titulo_projeto || dados.nomeProjeto || '',
      resumo: dados.resumo || '',
      campus: dados.campus || '',
      quantidadeMaximaAlunos: dados.quantidadeMaximaAlunos || 0,
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

  // ==========================================================================
  // ERROS
  // ==========================================================================

  /**
   * Handler único de erros HTTP. Retorna um objeto coeso para o caller.
   * Mantém logs no console (útil em dev).
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('❌ Erro HTTP:', error);
    let message = 'Erro inesperado';
    if (error.error instanceof ErrorEvent) {
      message = `Erro de rede: ${error.error.message}`;
    } else {
      message = error.error?.detail || `Erro ${error.status}`;
    }
    return throwError(() => ({
      message,
      status: error.status,
      error: error.error,
    }));
  };
}
