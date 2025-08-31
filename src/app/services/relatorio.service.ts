import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


// Contratos alinhados com o back
export interface RelatorioMensalOut {
  id_relatorio: number;
  projeto_id: number;
  mes: string;         // 'YYYY-MM'
  ok: boolean;
  observacao?: string;
  data_envio?: string; // opcional
}

export interface PendenciaOut {
  projeto_id: number;
  projeto_nome?: string;
  mes: string;         // 'YYYY-MM'
}

export interface ConfirmarRelatorioMensalDTO {
  mes: string;         // 'YYYY-MM'
  ok: boolean;
  observacao?: string;
}

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  private readonly apiBase = '/api';

  constructor(private http: HttpClient) {}

  /** GET /me/relatorios-mensais?mes=YYYY-MM  */
  listarDoMes(mes?: string): Observable<RelatorioMensalOut[]> {
    const params = mes ? new HttpParams().set('mes', mes) : undefined;
    return this.http.get<RelatorioMensalOut[]>(
      `${this.apiBase}/me/relatorios-mensais`,
      { params }
    );
  }

  /** GET /me/relatorios-mensais/pendentes?mes=YYYY-MM */
  listarPendentesDoMes(mes?: string): Observable<PendenciaOut[]> {
    const params = mes ? new HttpParams().set('mes', mes) : undefined;
    return this.http.get<PendenciaOut[]>(
      `${this.apiBase}/me/relatorios-mensais/pendentes`,
      { params }
    );
  }

  /** POST /{id_projeto}/relatorios-mensais/confirmar */
  confirmar(projetoId: number, dto: ConfirmarRelatorioMensalDTO):
    Observable<{ id_relatorio: number; mensagem: string }> {
    return this.http.post<{ id_relatorio: number; mensagem: string }>(
      `${this.apiBase}/${projetoId}/relatorios-mensais/confirmar`,
      dto
    );
  }

   baixarRelatorioAlunos() {
    return this.http.get(`${this.apiBase}/relatorio-alunos`, {
      responseType: 'blob',
      observe: 'response'
    });
  }
}
