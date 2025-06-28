import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

// ✅ Interfaces para tipagem
interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: string;
}

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

// Interface principal para exibição
interface Projeto {
  id: number;
  nomeProjeto: string;
  campus: string;
  quantidadeMaximaAlunos: number;
  nomeOrientador: string;
  nomesAlunos: string[];
}

// Detalhes para formulário
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

// Novo payload com base em IDs
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


  // ✅ Buscar todos os projetos (para a lista)
  listarProjetos(): Observable<Projeto[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(projetos => {
        console.log('📥 Dados brutos recebidos:', projetos);
        projetos.forEach((projeto, index) => {
          console.log(`📋 Projeto ${index + 1}`, {
            estrutura: projeto,
            tipoAlunos: typeof projeto.alunos,
            ehArrayAlunos: Array.isArray(projeto.alunos),
            tamanho: projeto.alunos?.length || 0
          });
        });
      }),
      map(projetos => projetos.map(p => this.normalizarProjeto(p)))
    );
  }

  // ✅ Normalizar estrutura vinda do backend
  private normalizarProjeto(dadosBrutos: any): Projeto {
    let nomeOrientador = 'Orientador não informado';

    if (dadosBrutos.nomeOrientador?.trim()) {
      nomeOrientador = dadosBrutos.nomeOrientador.trim();
    } else if (typeof dadosBrutos.orientador === 'string') {
      nomeOrientador = dadosBrutos.orientador.trim();
    } else if (typeof dadosBrutos.orientador === 'object' && dadosBrutos.orientador?.nome) {
      nomeOrientador = dadosBrutos.orientador.nome.trim();
    } else if (dadosBrutos.orientadorNome?.trim()) {
      nomeOrientador = dadosBrutos.orientadorNome.trim();
    } else if (dadosBrutos.professor?.trim()) {
      nomeOrientador = dadosBrutos.professor.trim();
    }

    let nomesAlunos: string[] = [];

    if (Array.isArray(dadosBrutos.nomesAlunos)) {
      nomesAlunos = dadosBrutos.nomesAlunos.filter((nome: string) => nome && nome.trim());
    } else if (Array.isArray(dadosBrutos.alunos)) {
      if (dadosBrutos.alunos.length > 0) {
        if (typeof dadosBrutos.alunos[0] === 'string') {
          nomesAlunos = dadosBrutos.alunos.filter((nome: string) => nome && nome.trim());
        } else if (typeof dadosBrutos.alunos[0] === 'object' && dadosBrutos.alunos[0]?.nome) {
          nomesAlunos = dadosBrutos.alunos
            .filter((aluno: { nome: string }) => aluno?.nome && aluno.nome.trim())
            .map((aluno: { nome: string }) => aluno.nome.trim());
        }
      }
    } else if (Array.isArray(dadosBrutos.estudantes)) {
      nomesAlunos = dadosBrutos.estudantes.filter((nome: string) => nome && nome.trim());
    } else if (Array.isArray(dadosBrutos.alunosNomes)) {
      nomesAlunos = dadosBrutos.alunosNomes.filter((nome: string) => nome && nome.trim());
    }

    return {
      id: dadosBrutos.id,
      nomeProjeto: dadosBrutos.nomeProjeto || 'Projeto sem nome',
      campus: dadosBrutos.campus || 'Campus não informado',
      quantidadeMaximaAlunos: dadosBrutos.quantidadeMaximaAlunos || 0,
      nomeOrientador,
      nomesAlunos
    };
  }

  // ✅ Buscar projeto por ID
  getProjetoPorId(id: number): Observable<ProjetoDetalhado> {
    return this.http.get<ProjetoDetalhado>(`${this.apiUrl}/${id}`).pipe(
      tap(projeto => console.log('📥 Projeto detalhado:', projeto))
    );
  }

  // ✅ Atualizar projeto
  atualizarProjeto(id: number, projeto: ProjetoCadastro): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, projeto).pipe(
      tap(response => console.log('✅ Projeto atualizado:', response))
    );
  }

  // ✅ Excluir projeto
  excluirProjeto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => console.log('✅ Projeto excluído com sucesso'))
    );
  }

  // ✅ Buscar usuários por papel (role)
  getUsuariosPorRole(role: string): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`http://localhost:8080/api/usuarios?role=${role}`);
  }
}

// ✅ Exportar os tipos necessários
export type {
  Projeto,
  ProjetoDetalhado,
  ProjetoCadastro as ProjetoCadastro,
  Aluno,
  Orientador,
  Usuario
};
