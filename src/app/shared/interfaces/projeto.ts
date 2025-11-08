// src/app/shared/interfaces/projeto.ts
import { Aluno } from '@interfaces/aluno';

export type StatusProjeto = 'EM_EXECUCAO' | 'CONCLUIDO';

/** DTO usado pelo endpoint POST /projetos/update-alunos */
export interface UpdateProjetoAlunosDTO {
  id_projeto: number;
  ids_alunos_aprovados: number[]; // ids de ALUNO aprovados pelo orientador
}

/** Payload mínimo aceito pelo backend ao criar/atualizar projeto (DTO -> backend) */
export interface ProjetoRequest {
  titulo_projeto: string;
  resumo: string;
  id_orientador: number;
  id_campus: number;
}

export interface ProjetoFormulario {
  titulo_projeto: string;
  resumo?: string;
  orientador_nome: string;
  id_campus: number;
  tipo_bolsa?: string | null;
}

export interface ProjetoCadastro {
  titulo_projeto: string;
  resumo: string;
  orientador_nome: string;
  orientador_email: string;
  id_campus: number;
  quantidadeMaximaAlunos: number;
  tipo_bolsa?: string | null;
}

/** Card/listagem simples (view model para listas) */
export interface Projeto {
  id: number;
  nomeProjeto: string;
  campus: string;
  quantidadeMaximaAlunos: number;
  nomeOrientador: string;
  nomesAlunos: string[];
  inscritosTotal?: number;
  status?: StatusProjeto;
  notas?: number[];
  mediaNota?: number;
}

/** Detalhes completos do projeto */
export interface ProjetoDetalhado {
  id: number;
  nomeProjeto: string;
  titulo_projeto: string;
  resumo?: string;
  campus: string;
  quantidadeMaximaAlunos: number;
  nomeOrientador: string;
  orientador_email?: string;
  nomesAlunos: string[];
  alunos?: Aluno[];
  id_orientador: number;
  id_campus: number;
  data_criacao?: string;
  data_atualizacao?: string;
  status?: string;
  tipo_bolsa?: string | null;
}
