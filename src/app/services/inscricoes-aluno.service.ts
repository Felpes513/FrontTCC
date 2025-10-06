import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class InscricaoAlunoService {
  private readonly api = '/api/inscricao';

  constructor(private http: HttpClient) {}

  inscrever(projetoId: number) {
    return this.http.post<{ success: boolean; message: string; data?: { id_inscricao: number } }>(
      `${this.api}/inscrever`,
      { id_projeto: projetoId }
    );
  }
}
