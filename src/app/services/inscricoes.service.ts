import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ListagemResponse } from '@interfaces/listagem';
import { Inscricao } from '@interfaces/inscricao';

@Injectable({ providedIn: 'root' })
export class InscricoesService {
  private http = inject(HttpClient);
  private baseUrl = '/api';

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
      .pipe(map(resp => resp.itens));
  }

  aprovar(inscricaoId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/inscricoes/${inscricaoId}/aprovar`, {});
  }

  finalizar(inscricaoId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/inscricoes/${inscricaoId}/finalizar`, {});
  }

  rejeitar(inscricaoId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/inscricoes/${inscricaoId}/rejeitar`, {});
  }

  excluir(inscricaoId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/inscricoes/${inscricaoId}`);
  }

  uploadDocumento(inscricaoId: number, arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return this.http.put(`${this.baseUrl}/inscricoes/${inscricaoId}/documento-notas`, formData);
  }
}