import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule
  ],
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.css']
})
export class RelatoriosComponent {
  tipoSelecionado: string = '';
  colunas: string[] = [];
  dados: any[] = [];

  onTipoRelatorioChange(): void {
    switch (this.tipoSelecionado) {
      case 'projetosResumo':
        this.colunas = ['numeroProjeto', 'nomeProjeto', 'orientador', 'quantidadeAlunos'];
        this.dados = [
          { numeroProjeto: 'P001', nomeProjeto: 'Inteligência Artificial', orientador: 'Prof. João', quantidadeAlunos: 4 },
          { numeroProjeto: 'P002', nomeProjeto: 'Banco de Dados', orientador: 'Prof. Ana', quantidadeAlunos: 3 },
        ];
        break;

      case 'alunosProjetos':
        this.colunas = ['aluno', 'projeto'];
        this.dados = [
          { aluno: 'Carlos Silva', projeto: 'IA aplicada à Saúde' },
          { aluno: 'Mariana Lima', projeto: 'Big Data para Negócios' },
        ];
        break;

      case 'orientadoresProjetos':
        this.colunas = ['orientador', 'projeto'];
        this.dados = [
          { orientador: 'Prof. João', projeto: 'IA aplicada à Saúde' },
          { orientador: 'Prof. João', projeto: 'Machine Learning em Imagens' },
          { orientador: 'Prof. Ana', projeto: 'Big Data para Negócios' },
        ];
        break;

      case 'projetosConcluidos':
        this.colunas = ['nomeProjeto', 'numeroProjeto', 'campus', 'orientador', 'dataInicio', 'dataConclusao'];
        this.dados = [
          {
            nomeProjeto: 'Projeto A',
            numeroProjeto: 'P2023-A',
            campus: 'São Caetano',
            orientador: 'Prof. Bruno',
            dataInicio: '01/02/2023',
            dataConclusao: '30/06/2023'
          },
          {
            nomeProjeto: 'Projeto B',
            numeroProjeto: 'P2023-B',
            campus: 'Paulista',
            orientador: 'Prof. Carla',
            dataInicio: '15/03/2023',
            dataConclusao: '15/07/2023'
          }
        ];
        break;

      default:
        this.colunas = [];
        this.dados = [];
        break;
    }
  }

  formatarNomeColuna(coluna: string): string {
  return coluna
    .replace(/([A-Z])/g, ' $1')    // adiciona espaço antes de maiúsculas
    .replace(/^./, c => c.toUpperCase());  // coloca a primeira letra em maiúscula
  }


  gerarRelatorioExcel(): void {
    if (!this.dados || this.dados.length === 0) {
      alert('Nenhum dado para exportar.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(this.dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');

    const nomeArquivo = `relatorio_${this.tipoSelecionado}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, nomeArquivo);
  }
}
