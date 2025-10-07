import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InscricoesService {
  private readonly api = '/api';

  constructor(private http: HttpClient) {}

  /** Aluno se inscreve em um projeto (usa token do aluno via interceptor). */
  inscrever(projetoId: number) {
    return this.http.post<{ success: boolean; message: string; data?: { id_inscricao: number } }>(
      `${this.api}/inscricao/inscrever`,
      { id_projeto: projetoId }
    );
  }

  /**
   * Lista os ALUNOS vinculados ao projeto (aprovados/válidos para o orientador).
   * Rota: GET /projetos/{id}/alunos  -> { id_projeto, alunos: [...] }
   * (Se o back devolver outro shape, ajuste o map abaixo sem dor.)
   */
  listarAprovadosDoProjeto(projetoId: number): Observable<any[]> {
    return this.http
      .get<{ id_projeto: number; alunos: any[] }>(`${this.api}/projetos/${projetoId}/alunos`)
      .pipe(map(r => Array.isArray(r?.alunos) ? r.alunos : []));
  }

  /**
   * (Opcional – fallback) Lista TODAS as inscrições do sistema
   * e filtra por projeto no front caso precise.
   */
  listarInscricoesSistema(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/inscricao/`);
  }

  /** Atualiza a seleção final do orientador para o projeto. */
  atualizarSelecao(projetoId: number, idsAlunosSelecionados: number[]) {
    return this.http.post<{ mensagem: string }>(`${this.api}/projetos/update-alunos`, {
      id_projeto: projetoId,
      id_alunos: idsAlunosSelecionados,
    });
  }
}
