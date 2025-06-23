import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProjetoService {
  private apiUrl = 'http://localhost:8080/api/secretaria/projetos';

  constructor(private http: HttpClient) {}

  cadastrarProjeto(projeto: any): Observable<any> {
    return this.http.post(this.apiUrl, projeto);
  }

  listarProjetos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getProjetoPorId(id: number) {
  return this.http.get<any>(`http://localhost:8080/api/secretaria/projetos/${id}`);
  }

  atualizarProjeto(id: number, projeto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, projeto);
  }

  excluirProjeto(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
