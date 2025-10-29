import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BolsaService {
  private readonly api = '/api/bolsas';

  constructor(private http: HttpClient) {}

  definirBolsa(idProjeto: number, idAluno: number, possui: boolean):
    Observable<{ id_projeto: number; id_aluno: number; possui_bolsa: boolean }> {
    return this.http.put<{ id_projeto: number; id_aluno: number; possui_bolsa: boolean }>(
      `${this.api}/projetos/${idProjeto}/alunos/${idAluno}`,
      { possui_bolsa: possui }
    );
  }
}
