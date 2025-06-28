import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProjetoService, Projeto } from '../projeto.service';

@Component({
  selector: 'app-listagem-projetos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './listagem-projetos.component.html',
  styleUrls: ['./listagem-projetos.component.css']
})
export class ListagemProjetosComponent implements OnInit {
  projetos: Projeto[] = [];
  filtro: string = '';
  carregando: boolean = false;
  erro: string | null = null;

  constructor(
    private projetoService: ProjetoService,
    private router: Router
  ) {}

  trackByFn(index: number, item: Projeto): any {
    return item.id || index;
  }

  ngOnInit(): void {
    this.carregarProjetos();
  }

  carregarProjetos(): void {
    this.carregando = true;
    this.erro = null;

    console.log('🔄 Iniciando carregamento dos projetos...');

    this.projetoService.listarProjetos().subscribe({
      next: (projetos) => {
        console.log('✅ Projetos processados e normalizados:', projetos);
        this.projetos = projetos;
        this.carregando = false;

        // Debug final - resumo do que foi carregado
        console.log('📊 RESUMO FINAL DOS PROJETOS:', {
          totalProjetos: this.projetos.length,
          projetosComOrientador: this.projetos.filter(p => p.nomeOrientador !== 'Orientador não informado').length,
          projetosComAlunos: this.projetos.filter(p => p.nomesAlunos.length > 0).length,
          detalhePorProjeto: this.projetos.map(p => ({
            id: p.id,
            nome: p.nomeProjeto,
            orientador: p.nomeOrientador,
            qtdAlunos: p.nomesAlunos.length,
            alunos: p.nomesAlunos
          }))
        });
      },
      error: (error) => {
        console.error('❌ Erro ao carregar projetos:', error);
        this.erro = 'Erro ao carregar projetos. Verifique sua conexão e tente novamente.';
        this.carregando = false;
      }
    });
  }

  projetosFiltrados(): Projeto[] {
    if (!this.filtro || this.filtro.trim() === '') {
      return this.projetos;
    }

    const filtroLower = this.filtro.toLowerCase();
    return this.projetos.filter(projeto =>
      projeto.nomeProjeto.toLowerCase().includes(filtroLower) ||
      projeto.nomeOrientador.toLowerCase().includes(filtroLower) ||
      projeto.campus.toLowerCase().includes(filtroLower)
    );
  }

  // ✅ Métodos auxiliares para o template
  getOrientadorNome(projeto: Projeto): string {
    return projeto.nomeOrientador;
  }

  getQuantidadeAlunos(projeto: Projeto): number {
    return projeto.nomesAlunos.length;
  }

  temAlunos(projeto: Projeto): boolean {
    return projeto.nomesAlunos.length > 0;
  }

  temOrientador(projeto: Projeto): boolean {
    return projeto.nomeOrientador !== 'Orientador não informado';
  }

  simularProgresso(index: number): number {
    return 30 + (index % 3) * 20;
  }

  getCor(index: number): string {
    const cores = ['#007bff', '#28a745', '#ffc107'];
    return cores[index % cores.length];
  }

  excluirProjeto(id: number): void {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      this.projetoService.excluirProjeto(id).subscribe({
        next: () => {
          console.log('✅ Projeto excluído com sucesso');
          this.projetos = this.projetos.filter(p => p.id !== id);
          alert('Projeto excluído com sucesso!');
        },
        error: (error) => {
          console.error('❌ Erro ao excluir projeto:', error);
          alert('Erro ao excluir projeto. Tente novamente.');
        }
      });
    }
  }

  editarProjeto(id: number): void {
    console.log('📝 Navegando para editar projeto ID:', id);
    this.router.navigate(['/secretaria/projetos/editar', id]);
  }

  recarregar(): void {
    this.carregarProjetos();
  }
}
