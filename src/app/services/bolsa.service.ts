import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

export interface BolsaRow {
  id_aluno: number;
  nome_completo: string;
  email: string;
  possui_bolsa: boolean;
}

@Injectable({ providedIn: 'root' })
export class BolsaService {
  private readonly base = `${environment.apiBaseUrl}/bolsas`;

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<BolsaRow[]>(this.base);
  }

  /** POST /bolsas  -> { id_aluno, possui_bolsa } */
  create(id_aluno: number, possui_bolsa: boolean) {
    return this.http.post(this.base + '/', { id_aluno, possui_bolsa });
  }

  /** PUT /bolsas/{id_aluno} -> { possui_bolsa } */
  setStatus(id_aluno: number, possui_bolsa: boolean) {
    return this.http.put(`${this.base}/${id_aluno}`, { possui_bolsa });
  }
}
