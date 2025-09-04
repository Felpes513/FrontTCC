import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface InscricaoDTO {
  id?: number;
  id_inscricao?: number;
  id_projeto?: number;
  projeto_id?: number;
  status?: string;
  aluno?: {
    id?: number;
    nome?: string;
    email?: string;
    matricula?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class InscricoesService {
  private http = inject(HttpClient);
  private baseUrl = '/api';

  listarPorProjeto(
    projetoId: number,
    pagina: number = 1,
    limite: number = 50
  ): Observable<InscricaoDTO[]> {
    let params = new HttpParams()
      .set('projeto_id', String(projetoId))
      .set('pagina', String(pagina))
      .set('limite', String(limite));

    return this.http
      .get<InscricaoDTO[]>(`${this.baseUrl}/inscricoes`, { params })
      .pipe(
        map((data: any) => {
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.itens)) return data.itens;
          if (Array.isArray(data?.items)) return data.items;
          return [];
        })
      );
  }

  inscreverNoProjeto(projetoId: number): Observable<{
    success: boolean;
    message: string;
    data?: { id_inscricao: number };
  }> {
    const body = { id_projeto: projetoId };

    return this.http.post<{
      success: boolean;
      message: string;
      data?: { id_inscricao: number };
    }>(`${this.baseUrl}/inscricoes/inscrever`, body);
  }

  obterPorId(inscricaoId: number): Observable<InscricaoDTO> {
    return this.http.get<InscricaoDTO>(
      `${this.baseUrl}/inscricoes/${inscricaoId}`
    );
  }

  excluir(inscricaoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/inscricoes/${inscricaoId}`);
  }

  /*uploadDocumento(inscricaoId: number, arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    // Verifique se esse endpoint existe no back. Se não existir ainda, deixe comentado.
    return this.http.put(`${this.baseUrl}/inscricoes/${inscricaoId}/documento-notas`, formData);
  }*/
}
