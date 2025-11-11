import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly apiUrl = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  // ===== CAMPUS =====
  listarCampus() {
    return this.http.get<{ campus: any[] }>(`${this.apiUrl}/campus`);
  }
  criarCampus(body: any) {
    return this.http.post(`${this.apiUrl}/campus/`, body);
  }
  excluirCampus(id: number) {
    return this.http.delete(`${this.apiUrl}/campus/${id}`);
  }

  // ===== CURSOS =====
  listarCursos() {
    return this.http.get<{ cursos: any[] }>(`${this.apiUrl}/cursos`);
  }
  criarCurso(body: any) {
    return this.http.post(`${this.apiUrl}/cursos/`, body);
  }
  excluirCurso(id: number) {
    return this.http.delete(`${this.apiUrl}/cursos/${id}`);
  }

  listarTiposBolsa() {
    return this.http.get<any>(`${this.apiUrl}/bolsas/tipos`);
  }
  criarTipoBolsa(body: { nome: string }) {
    return this.http.post(`${this.apiUrl}/bolsas/tipos`, body);
  }
  excluirTipoBolsa(id_bolsa: number) {
    return this.http.delete(`${this.apiUrl}/bolsas/tipos/${id_bolsa}`);
  }
}
