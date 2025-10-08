import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ListagemResponse } from '@interfaces/listagem';
import { Inscricao } from '@interfaces/inscricao';

@Injectable({ providedIn: 'root' })
export class InscricoesService {
  private http = inject(HttpClient);
  private baseUrl = '/api';

  // Aluno se inscreve em um projeto
  inscrever(projetoId: number) {
    return this.http.post<{ success: boolean; message: string; data?: { id_inscricao: number } }>(
      `${this.baseUrl}/inscricao/inscrever`,
      { id_projeto: projetoId }
    );
  }

  // Lista genérica de inscrições (se você usar)
  listarPorProjeto(
    projetoId: number,
    status?: string,
    pagina = 1,
    limite = 20,
    ordenarPor = 'nome',
    ordem: 'asc' | 'desc' = 'asc'
  ): Observable<Inscricao[]> {
    let params = new HttpParams()
      .set('pagina', pagina)
      .set('limite', limite)
      .set('ordenarPor', ordenarPor)
      .set('ordem', ordem);
    if (status) params = params.set('status', status);

    return this.http
      .get<ListagemResponse>(`${this.baseUrl}/projetos/${projetoId}/inscricoes`, { params })
      .pipe(map(resp => resp.itens));
  }

  // Orientador – aprovados do projeto (usa o endpoint existente do back)
  listarAprovadosDoProjeto(projetoId: number) {
    return this.http.get<{ id_projeto:number; alunos:any[] }>(
      `${this.baseUrl}/projetos/${projetoId}/alunos`
    ).pipe(map(r => r.alunos || []));
  }

  // (se você ainda usa)
  aprovar(inscricaoId: number) { return this.http.patch(`${this.baseUrl}/inscricoes/${inscricaoId}/aprovar`, {}); }
  finalizar(inscricaoId: number) { return this.http.patch(`${this.baseUrl}/inscricoes/${inscricaoId}/finalizar`, {}); }
  rejeitar(inscricaoId: number) { return this.http.patch(`${this.baseUrl}/inscricoes/${inscricaoId}/rejeitar`, {}); }
  excluir(inscricaoId: number) { return this.http.delete(`${this.baseUrl}/inscricoes/${inscricaoId}`); }
  uploadDocumento(inscricaoId: number, arquivo: File) {
    const formData = new FormData(); formData.append('arquivo', arquivo);
    return this.http.put(`${this.baseUrl}/inscricoes/${inscricaoId}/documento-notas`, formData);
  }
}
