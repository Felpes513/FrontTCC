// src/app/shared/interfaces/projeto.ts
import { Aluno } from '@interfaces/aluno';

export type StatusProjeto = 'EM_EXECUCAO' | 'CONCLUIDO';
export type EtapaDocumento = 'IDEIA' | 'PARCIAL' | 'FINAL';
export type StatusEnvio = 'NAO_ENVIADO' | 'ENVIADO';

/** Payload aceito pelo backend ao criar/atualizar projeto (DTO -> backend) */
export interface ProjetoRequest {
  titulo_projeto: string;
  resumo: string;
  id_orientador: number;
  id_campus: number;
  cod_projeto?: string; // NOVO
  ideia_inicial_b64?: string; // NOVO (arquivo da etapa "Ideia" em base64)
}

export interface ProjetoFormulario {
  titulo_projeto: string;
  resumo?: string;
  orientador_nome: string;
  id_campus: number;
  tipo_bolsa?: string | null;
  cod_projeto?: string; // NOVO (editar/mostrar no form se quiser)
}

export interface ProjetoCadastro {
  titulo_projeto: string;
  resumo: string;
  orientador_nome: string;
  orientador_email: string;
  id_campus: number;
  quantidadeMaximaAlunos: number;
  tipo_bolsa?: string | null;
  cod_projeto?: string; // NOVO
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

/** Detalhes completos do projeto (tela de detalhes / response do backend + enriquecimentos) */
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

export interface DocumentoHistorico {
  etapa: EtapaDocumento;
  status: StatusEnvio;
  dataEnvio?: Date;
  arquivos?: {
    pdf?: { nome: string };
    docx?: { nome: string };
  };
}
