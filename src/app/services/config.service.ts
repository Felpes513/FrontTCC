// src/app/services/config.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Campus {
  id?: number;
  nome: string;
}

export interface Curso {
  id?: number;
  nome: string;
}

export interface Bolsa {
  id?: number;
  nome: string;
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly apiUrl = '/api';

  constructor(private http: HttpClient) {}

  // ======= CAMPUS =======
  listarCampus(): Observable<{ campus: Campus[] }> {
    return this.http.get<{ campus: Campus[] }>(`${this.apiUrl}/campus`);
  }

  criarCampus(campus: Campus): Observable<any> {
    return this.http.post(`${this.apiUrl}/campus`, campus);
  }

  // ======= CURSOS =======
  listarCursos(): Observable<{ cursos: Curso[] }> {
    return this.http.get<{ cursos: Curso[] }>(`${this.apiUrl}/cursos`);
  }

  criarCurso(curso: Curso): Observable<any> {
    return this.http.post(`${this.apiUrl}/cursos`, curso);
  }

  // ======= BOLSAS =======
  listarBolsas(): Observable<{ bolsas: Bolsa[] }> {
    return this.http.get<{ bolsas: Bolsa[] }>(`${this.apiUrl}/bolsas`);
  }

  criarBolsa(bolsa: Bolsa): Observable<any> {
    return this.http.post(`${this.apiUrl}/bolsas`, bolsa);
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
}
