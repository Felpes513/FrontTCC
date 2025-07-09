import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError, switchMap } from 'rxjs/operators';


//Esses export interfaces definem a estrutura de dados trocados entre o frontend e o backend
export interface ProjetoRequest {
  titulo_projeto: string;
  resumo?: string;
  id_orientador: number;
  id_campus: number;
}

export interface Projeto {
  id: number;
  nomeProjeto: string;
  campus: string;
  quantidadeMaximaAlunos: number;
  nomeOrientador: string;
  nomesAlunos: string[];
}

export interface ProjetoFormulario {
  titulo_projeto: string;
  resumo?: string;
  orientador_nome: string;
  orientador_email?: string;
  campus_nome: string;
}

export interface ProjetoCadastro {
  titulo_projeto: string;
  resumo?: string;
  orientador_nome: string;
  orientador_email?: string;
  campus_nome: string;
  quantidadeMaximaAlunos?: number;
}

export interface Aluno {
  id?: number;
  nome: string;
  email: string;
  ra?: string;
  curso?: string;
  telefone?: string;
  documentoNotasUrl?: string;
}

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

export interface Orientador {
  id: number;
  nome_completo: string;
  email?: string;
}

export interface Campus {
  id: number;
  campus: string;
}

@Injectable({ providedIn: 'root' })
export class ProjetoService {
  private apiUrl = 'http://localhost:8000/projetos';

  constructor(private http: HttpClient) {}

  cadastrarProjetoCompleto(projeto: ProjetoCadastro): Observable<any> {
    const formulario: ProjetoFormulario = {
      titulo_projeto: projeto.titulo_projeto,
      resumo: projeto.resumo,
      orientador_nome: projeto.orientador_nome,
      orientador_email: projeto.orientador_email,
      campus_nome: projeto.campus_nome
    };

    return this.processarDadosECadastrar(formulario);
  }

  private processarDadosECadastrar(formulario: ProjetoFormulario): Observable<any> {
    return this.buscarOrientadorPorNome(formulario.orientador_nome).pipe(
      switchMap((orientador: Orientador) =>
        this.buscarCampusPorNome(formulario.campus_nome).pipe(
          catchError(() => this.criarCampus(formulario.campus_nome)),
          map((campus: Campus) => ({ orientador, campus }))
        )
      ),
      switchMap(({ orientador, campus }) => {
        const projetoRequest: ProjetoRequest = {
          titulo_projeto: formulario.titulo_projeto,
          resumo: formulario.resumo || '',
          id_orientador: orientador.id,
          id_campus: campus.id
        };

        return this.http.post(this.apiUrl, projetoRequest).pipe(
          tap(response => console.log('✅ Projeto cadastrado:', response)),
          catchError(this.handleError)
        );
      })
    );
  }

  listarProjetos(): Observable<Projeto[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(projetos => projetos.map(p => this.normalizarProjeto(p))),
      catchError(this.handleError)
    );
  }

  getProjetoPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getProjetoDetalhado(id: number): Observable<ProjetoDetalhado> {
    return this.http.get<any>(`${this.apiUrl}/${id}/detalhado`).pipe(
      map(projeto => this.normalizarProjetoDetalhado(projeto)),
      catchError(() => this.getProjetoPorId(id).pipe(
        map(projeto => this.normalizarProjetoDetalhado(projeto))
      ))
    );
  }

  atualizarProjeto(id: number, formulario: ProjetoFormulario): Observable<any> {
    return this.buscarOrientadorPorNome(formulario.orientador_nome).pipe(
      switchMap((orientador: Orientador) =>
        this.buscarCampusPorNome(formulario.campus_nome).pipe(
          catchError(() => this.criarCampus(formulario.campus_nome)),
          map((campus: Campus) => ({ orientador, campus }))
        )
      ),
      switchMap(({ orientador, campus }) => {
        const projetoRequest: ProjetoRequest = {
          titulo_projeto: formulario.titulo_projeto,
          resumo: formulario.resumo || '',
          id_orientador: orientador.id,
          id_campus: campus.id
        };

        return this.http.put(`${this.apiUrl}/${id}`, projetoRequest).pipe(
          catchError(this.handleError)
        );
      })
    );
  }

  excluirProjeto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // === ORIENTADORES E CAMPUS ===

  listarOrientadores(): Observable<Orientador[]> {
    return this.http.get<Orientador[]>('http://localhost:8000/orientadores/').pipe(
      catchError(this.handleError)
    );
  }

  buscarOrientadorPorNome(nome: string): Observable<Orientador> {
    return this.http.get<Orientador>(
      `http://localhost:8000/orientadores/buscar?nome=${encodeURIComponent(nome)}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  listarCampus(): Observable<Campus[]> {
    return this.http.get<Campus[]>('http://localhost:8000/campus/').pipe(
      catchError(this.handleError)
    );
  }

  buscarCampusPorNome(nome: string): Observable<Campus> {
    return this.http.get<Campus>(
      `http://localhost:8000/campus/buscar?nome=${encodeURIComponent(nome)}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  criarCampus(nome: string): Observable<Campus> {
    return this.http.post<Campus>('http://localhost:8000/campus/', {
      campus: nome
    }).pipe(
      catchError(this.handleError)
    );
  }

  // === ALUNOS E INSCRIÇÕES ===

  listarInscricoesPorProjeto(idProjeto: number): Observable<any[]> {
    return this.http.get<any[]>(
      `http://localhost:8000/inscricoes/projetos/${idProjeto}/inscricoes`
    ).pipe(
      catchError(this.handleError)
    );
  }

  aprovarAluno(id: number): Observable<any> {
    return this.http.post(`http://localhost:8000/inscricoes/${id}/aprovar`, {}).pipe(
      catchError(this.handleError)
    );
  }

  excluirAluno(id: number): Observable<any> {
    return this.http.delete(`http://localhost:8000/inscricoes/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // === NORMALIZAÇÃO ===

  private normalizarProjeto(dados: any): Projeto {
    return {
      id: dados.id || dados.id_projeto,
      nomeProjeto: dados.nomeProjeto || dados.titulo_projeto || 'Sem título',
      campus: dados.campus || '',
      quantidadeMaximaAlunos: dados.quantidadeMaximaAlunos || 0,
      nomeOrientador: dados.nomeOrientador || '',
      nomesAlunos: dados.nomesAlunos || []
    };
  }

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
      status: dados.status || ''
    };
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('❌ Erro HTTP:', error);
    let errorMessage = 'Erro inesperado';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro de rede: ${error.error.message}`;
    } else {
      errorMessage = error.error?.detail || `Erro ${error.status}`;
    }
    return throwError(() => ({
      message: errorMessage,
      status: error.status,
      error: error.error
    }));
  }
}
