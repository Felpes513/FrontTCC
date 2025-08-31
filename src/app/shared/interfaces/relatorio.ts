export interface Relatorio {
  id?: number;
  projetoId: number;
  referenciaMes: string;
  resumo: string;
  atividades?: string;
  bloqueios?: string;
  proximosPassos?: string;
  horas?: number;
  anexoUrl?: string;
  criadoEm?: string;
}
