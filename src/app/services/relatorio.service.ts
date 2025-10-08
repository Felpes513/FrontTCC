import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { RelatorioMensal, PendenciaMensal, ConfirmarRelatorioMensalDTO } from '@interfaces/relatorio';

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  private readonly apiBase = '/api';
  constructor(private http: HttpClient) {}

  // ORIENTADOR
  listarDoMes(mes?: string): Observable<RelatorioMensal[]> {
    const params = mes ? new HttpParams().set('mes', mes) : undefined;
    return this.http.get<any[]>(`${this.apiBase}/me/relatorios-mensais`, { params })
      .pipe(map(rows => (rows || []).map(r => ({
        id: r.id_relatorio,
        projetoId: r.id_projeto,
        referenciaMes: r.mes,
        ok: !!r.ok,
        observacao: r.observacao ?? null,
        confirmadoEm: r.confirmado_em,
        idOrientador: r.id_orientador
      } as RelatorioMensal))));
  }

  listarPendentesDoMes(mes?: string): Observable<PendenciaMensal[]> {
    const params = mes ? new HttpParams().set('mes', mes) : undefined;
    return this.http.get<any[]>(`${this.apiBase}/me/relatorios-mensais/pendentes`, { params })
      .pipe(map(rows => (rows || []).map(r => ({
        projetoId: r.id_projeto,
        tituloProjeto: r.titulo_projeto,
        mes: mes || '',            // o back não manda o mês, então completamos
      } as PendenciaMensal))));
  }

  confirmar(projetoId: number, dto: ConfirmarRelatorioMensalDTO)
    : Observable<{ id_relatorio: number; mensagem: string }> {
    return this.http.post<{ id_relatorio: number; mensagem: string }>(
      `${this.apiBase}/${projetoId}/relatorios-mensais/confirmar`, dto);
  }

  baixarRelatorioAlunos() {
    return this.http.get(`${this.apiBase}/relatorio-alunos`, {
      responseType: 'blob',
      observe: 'response'
    });
  }

  // SECRETARIA
  listarRecebidosSecretaria(mes?: string): Observable<RelatorioMensal[]> {
    const params = mes ? new HttpParams().set('mes', mes) : undefined;
    return this.http.get<any[]>(`${this.apiBase}/relatorios-mensais`, { params })
      .pipe(map(rows => (rows || []).map(r => ({
        id: r.id_relatorio,
        projetoId: r.id_projeto,
        referenciaMes: r.mes,
        ok: !!r.ok,
        observacao: r.observacao ?? null,
        confirmadoEm: r.confirmado_em,
        tituloProjeto: r.titulo_projeto,
        orientadorNome: r.orientador_nome
      } as RelatorioMensal))));
  }

  listarPendentesSecretaria(mes?: string): Observable<PendenciaMensal[]> {
    const params = mes ? new HttpParams().set('mes', mes) : undefined;
    return this.http.get<any[]>(`${this.apiBase}/relatorios-mensais/pendentes`, { params })
      .pipe(map(rows => (rows || []).map(r => ({
        projetoId: r.id_projeto,
        tituloProjeto: r.titulo_projeto,
        orientadorNome: r.orientador_nome,
        mes: r.mes || mes || ''
      } as PendenciaMensal))));
  }
}
