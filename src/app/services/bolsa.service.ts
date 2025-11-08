import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

export interface BolsaRow {
  id_aluno: number;
  nome_completo: string;
  email: string;
  possui_bolsa: boolean;
}

@Injectable({ providedIn: 'root' })
export class BolsaService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/bolsas`;

  /** Lista o status de bolsa por aluno (tabela global de bolsas) */
  listar(): Observable<BolsaRow[]> {
    return this.http.get<BolsaRow[]>(`${this.base}`);
  }

  /**
   * Upsert por aluno: define se o aluno possui bolsa globalmente.
   * PUT /bolsas/{id_aluno} body { possui_bolsa: boolean }
   */
  setStatus(
    id_aluno: number,
    possui: boolean
  ): Observable<{ id_aluno: number; possui_bolsa: boolean }> {
    return this.http.put<{ id_aluno: number; possui_bolsa: boolean }>(
      `${this.base}/${id_aluno}`,
      { possui_bolsa: !!possui }
    );
    // Se sua API exigir POST para inserir e PUT para atualizar,
    // mantenha este PUT como "upsert" do lado servidor.
  }

  /** (Opcional) Criar explicitamente um registro de bolsa para o aluno */
  create(id_aluno: number, possui: boolean) {
    return this.http.post(`${this.base}`, {
      id_aluno,
      possui_bolsa: !!possui,
    });
  }
}
