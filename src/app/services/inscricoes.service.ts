// src/app/secretaria/listagem-de-alunos/inscricoes.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // ✅ import CORRETO aqui no topo

export interface Inscricao {
  id: number;
  alunoId: number;
  nome: string;
  matricula: string;
  email: string;
  status: 'PENDENTE' | 'VALIDADO' | 'CADASTRADO_FINAL' | 'REJEITADO';
  documentoNotasUrl?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ListagemResponse {
  projetoId: number;
  capacidadeMaxima: number;
  totalInscritos: number;
  totalAprovados: number;
  itens: Inscricao[];
  paginacao: {
    pagina: number;
    limite: number;
    total: number;
    temMais: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class InscricoesService {
  private http = inject(HttpClient);
  private baseUrl = '/api'; // ajuste conforme a base real do backend

  /** Listar inscrições de um projeto com filtros e paginação.
   *  O service já retorna apenas os itens (Inscricao[]). */
  listarPorProjeto(
    projetoId: number,
    status?: string,
    pagina: number = 1,
    limite: number = 20,
    ordenarPor: string = 'nome',
    ordem: 'asc' | 'desc' = 'asc'
  ): Observable<Inscricao[]> {
    let params = new HttpParams()
      .set('pagina', pagina)
      .set('limite', limite)
      .set('ordenarPor', ordenarPor)
      .set('ordem', ordem);

    if (status) {
      params = params.set('status', status);
    }

    return this.http
      .get<ListagemResponse>(`${this.baseUrl}/projetos/${projetoId}/inscricoes`, { params })
      .pipe(map(resp => resp.itens)); // ✅ só os itens
  }

  /** Aprovar inscrição (Secretaria) */
  aprovar(inscricaoId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/inscricoes/${inscricaoId}/aprovar`, {});
  }

  /** Validar inscrição final (Orientador) */
  finalizar(inscricaoId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/inscricoes/${inscricaoId}/finalizar`, {});
  }

  /** Rejeitar inscrição mantendo histórico */
  rejeitar(inscricaoId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/inscricoes/${inscricaoId}/rejeitar`, {});
  }

  /** Excluir inscrição definitivamente */
  excluir(inscricaoId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/inscricoes/${inscricaoId}`);
  }

  /** Upload/atualização de documento de notas */
  uploadDocumento(inscricaoId: number, arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return this.http.put(`${this.baseUrl}/inscricoes/${inscricaoId}/documento-notas`, formData);
  }
}
