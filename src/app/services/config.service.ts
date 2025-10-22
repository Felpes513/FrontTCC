import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { Campus } from '@interfaces/campus';
import { Curso } from '@interfaces/curso';
import { Bolsa } from './../shared/interfaces/bolsa';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly apiUrl = environment.apiUrl; // <— trocado

  constructor(private http: HttpClient) {}

  listarCampus(): Observable<{ campus: Campus[] }> {
    return this.http.get<{ campus: Campus[] }>(`${this.apiUrl}/campus`);
  }

  criarCampus(campus: Partial<Campus>): Observable<any> {
    return this.http.post(`${this.apiUrl}/campus/`, campus);
  }

  listarCursos(): Observable<{ cursos: Curso[] }> {
    return this.http.get<{ cursos: Curso[] }>(`${this.apiUrl}/cursos`);
  }

  criarCurso(curso: Partial<Curso>): Observable<any> {
    return this.http.post(`${this.apiUrl}/cursos/`, curso);
  }

  criarBolsa(bolsa: Partial<Bolsa>): Observable<any> {
    return this.http.post(`${this.apiUrl}/bolsas/`, bolsa);
  }

  listarBolsas(): Observable<{ bolsas: Bolsa[] }> {
    return this.http.get<{ bolsas: Bolsa[] }>(`${this.apiUrl}/bolsas`);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, novaSenha: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      token,
      nova_senha: novaSenha,
    });
  }

  resetPasswordDirect(body: {
    perfil: 'aluno' | 'orientador' | 'secretaria';
    email: string;
    cpf: string;
    nova_senha: string;
  }) {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/reset-password-direct`,
      body
    );
  }
}
