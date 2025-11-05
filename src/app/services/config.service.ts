import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Campus } from '@interfaces/campus';
import { Curso } from '@interfaces/curso';
import { Bolsa } from './../shared/interfaces/bolsa';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // ======= CAMPUS =======
  listarCampus(): Observable<{ campus: Campus[] }> {
    return this.http.get<{ campus: Campus[] }>(`${this.apiUrl}/campus`);
  }

  criarCampus(campus: Partial<Campus>): Observable<any> {
    return this.http.post(`${this.apiUrl}/campus/`, campus);
  }

  // ======= CURSOS =======
  listarCursos(): Observable<{ cursos: Curso[] }> {
    return this.http.get<{ cursos: Curso[] }>(`${this.apiUrl}/cursos`);
  }

  criarCurso(curso: Partial<Curso>): Observable<any> {
    return this.http.post(`${this.apiUrl}/cursos/`, curso);
  }

  // ======= BOLSAS =======
  criarBolsa(bolsa: Partial<Bolsa>): Observable<any> {
    return this.http.post(`${this.apiUrl}/bolsas/`, bolsa);
  }

  listarBolsas(): Observable<{ bolsas: Bolsa[] }> {
    return this.http.get<{ bolsas: Bolsa[] }>(`${this.apiUrl}/bolsas`);
  }

  // ======= RESET SENHA =======
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
      `${environment.apiBaseUrl}/reset-password-direct`,
      body
    );
  }
}
