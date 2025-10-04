import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ---------- Contratos (me/orientador) ----------
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

// ---------- Contratos (secretaria) ----------
export interface RelatorioMensalSecretaria {
  id_relatorio: number;
  id_projeto: number;
  titulo_projeto: string;
  orientador_nome?: string;
  mes: string;                  // 'YYYY-MM'
  ok: boolean;
  observacao?: string | null;
  confirmado_em: string;        // ISO
}

export interface PendenciaSecretaria {
  id_projeto: number;
  titulo_projeto: string;
  orientador_nome?: string;
  mes?: string;                 // 'YYYY-MM' (opcional)
}

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  private readonly apiBase = '/api';

  constructor(private http: HttpClient) {}

  /** GET /me/relatorios-mensais?mes=YYYY-MM  (orientador logado) */
  listarDoMes(mes?: string): Observable<RelatorioMensalOut[]> {
    const params = mes ? new HttpParams().set('mes', mes) : undefined;
    return this.http.get<RelatorioMensalOut[]>(
      `${this.apiBase}/me/relatorios-mensais`,
      { params }
    );
  }

  /** GET /me/relatorios-mensais/pendentes?mes=YYYY-MM (orientador logado) */
  listarPendentesDoMes(mes?: string): Observable<PendenciaOut[]> {
    const params = mes ? new HttpParams().set('mes', mes) : undefined;
    return this.http.get<PendenciaOut[]>(
      `${this.apiBase}/me/relatorios-mensais/pendentes`,
      { params }
    );
  }

  /** POST /{id_projeto}/relatorios-mensais/confirmar (orientador) */
  confirmar(
    projetoId: number,
    dto: ConfirmarRelatorioMensalDTO
  ): Observable<{ id_relatorio: number; mensagem: string }> {
    return this.http.post<{ id_relatorio: number; mensagem: string }>(
      `${this.apiBase}/${projetoId}/relatorios-mensais/confirmar`,
      dto
    );
  }

  /** (já existia) XLSX de alunos */
  baixarRelatorioAlunos() {
    return this.http.get(`${this.apiBase}/relatorio-alunos`, {
      responseType: 'blob',
      observe: 'response'
    });
  }

  // ===========================
  // SECRETARIA – Listagens do mês
  // (Se o back ainda não tiver, o componente lida com erro)
  // ===========================
  /** GET /relatorios-mensais?mes=YYYY-MM  */
  listarRecebidosSecretaria(mes?: string): Observable<RelatorioMensalSecretaria[]> {
    const params = mes ? new HttpParams().set('mes', mes) : undefined;
    return this.http.get<RelatorioMensalSecretaria[]>(
      `${this.apiBase}/relatorios-mensais`,
      { params }
    );
  }

  /** GET /relatorios-mensais/pendentes?mes=YYYY-MM */
  listarPendentesSecretaria(mes?: string): Observable<PendenciaSecretaria[]> {
    const params = mes ? new HttpParams().set('mes', mes) : undefined;
    return this.http.get<PendenciaSecretaria[]>(
      `${this.apiBase}/relatorios-mensais/pendentes`,
      { params }
    );
  }
}
