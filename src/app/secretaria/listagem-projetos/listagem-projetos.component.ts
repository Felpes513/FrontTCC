import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjetoService } from '../projeto.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-listagem-projetos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './listagem-projetos.component.html',
  styleUrls: ['./listagem-projetos.component.css']
})
export class ListagemProjetosComponent implements OnInit {
  filtro: string = '';
  projetos: any[] = [];

  constructor(private projetoService: ProjetoService) {}

  ngOnInit(): void {
    this.projetoService.listarProjetos().subscribe({
      next: (res) => {
        this.projetos = res.map(p => ({
          id: p.id,
          nomeProjeto: p.nomeProjeto,
          campus: p.campus,
          quantidadeMaximaAlunos: p.quantidadeMaximaAlunos,
          nomeOrientador: p.orientador?.nome,
          nomesAlunos: p.alunos?.map((a: any) => a.nome)
        }));
      },
      error: (err) => console.error('Erro ao carregar projetos', err)
    });
  }

  projetosFiltrados() {
    return this.projetos.filter(p =>
      p.nomeProjeto.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

  simularProgresso(index: number): number {
    return [20, 40, 60, 80, 100][index % 5];
  }

  getCor(index: number): string {
    const progresso = this.simularProgresso(index);
    if (progresso >= 80) return '#00c853';
    if (progresso >= 50) return '#ffeb3b';
    return '#f44336';
  }

  excluirProjeto(id: number) {
  if (confirm('Tem certeza que deseja excluir este projeto?')) {
    this.projetoService.excluirProjeto(id).subscribe({
      next: () => {
        this.projetos = this.projetos.filter(p => p.id !== id);
        alert('Projeto excluído com sucesso!');
      },
      error: () => {
        alert('Erro ao excluir o projeto');
      }
    });
  }
}

}