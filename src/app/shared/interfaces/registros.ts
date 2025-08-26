// src/app/shared/interfaces/registros.ts  (ou mova para src/app/interfaces/registros.ts)

export interface RegisterAlunoData {
  nomeCompleto: string;
  cpf: string;
  curso: string;
  campus: string;
  email: string;
  senha: string;
}

export interface RegisterOrientadorData {
  nomeCompleto: string;
  email: string;
  senha: string;
  cpf: string;
}

export interface RegisterSecretariaData {
  nomeCompleto: string;
  email: string;
  senha: string;
}

export interface RegisterResponse {
  message: string;
  id?: number;
  email?: string;
}
