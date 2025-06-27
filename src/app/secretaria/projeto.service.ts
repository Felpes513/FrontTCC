import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ✅ Interfaces para tipagem
interface Aluno {
  id?: number;
  nome: string;
  email: string;
}

interface Orientador {
  id?: number;
  nome: string;
  email?: string;
}

// Usado na LISTAGEM
interface Projeto {
  id: number;
  nomeProjeto: string;
  campus: string;
  quantidadeMaximaAlunos: number;
  nomeOrientador: string;
  nomesAlunos: string[];
}

// Usado no FORMULÁRIO (detalhe do projeto)
interface ProjetoDetalhado {
  id?: number;
  nomeProjeto: string;
  campus: string;
  orientador: {
    nome: string;
    email?: string;
  };
  alunos: {
    nome: string;
    email: string;
  }[];
}

interface ProjetoCadastro {
  nomeProjeto: string;
  campus: string;
  orientador: {
    nome: string;
    email?: string;
  };
  alunos: {
    nome: string;
    email: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class ProjetoService {
  private apiUrl = 'http://localhost:8080/api/secretaria/projetos';

  constructor(private http: HttpClient) {}

  cadastrarProjeto(projeto: ProjetoCadastro): Observable<any> {
    return this.http.post(this.apiUrl, projeto);
  }

  listarProjetos(): Observable<Projeto[]> {
    return this.http.get<Projeto[]>(this.apiUrl);
  }

  getProjetoPorId(id: number): Observable<ProjetoDetalhado> {
    return this.http.get<ProjetoDetalhado>(`${this.apiUrl}/${id}`);
  }

  atualizarProjeto(id: number, projeto: ProjetoCadastro): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, projeto);
  }

  excluirProjeto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

// ✅ Exportar as interfaces para usar em outros componentes
export type {
  Projeto,
  ProjetoDetalhado,
  ProjetoCadastro,
  Aluno,
  Orientador
};
