// src/app/orientador/listagem-projetos/listagem-projetos.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProjetoService } from '@services/projeto.service';
import { Projeto } from '@interfaces/projeto';

@Component({
  standalone: true,
  selector: 'app-listagem-projetos',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './listagem-projetos.component.html',
  styleUrls: ['./listagem-projetos.component.css']
})
export class ListagemProjetosComponent implements OnInit {

  projetos: Projeto[] = [];
  carregando = false;
  erro = '';

  filtro = '';
  filtroStatus: '' | 'EM_EXECUCAO' | 'CONCLUIDO' = '';

  private cores = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

  constructor(
    private projetoService: ProjetoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.recarregar();
  }

  recarregar(): void {
    this.carregando = true;
    this.erro = '';

    this.projetoService.listarProjetosDoOrientador().subscribe({
      next: (dados) => {
        this.projetos = Array.isArray(dados) ? dados : [];
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Falha ao carregar projetos do orientador.';
        this.carregando = false;
      }
    });
  }

  projetosFiltrados(): Projeto[] {
    const termo = (this.filtro || '').toLowerCase().trim();
    return this.projetos.filter(p => {
      const okStatus = !this.filtroStatus || (p.status || '').toUpperCase() === this.filtroStatus;
      const nomeProjeto = this.getNomeProjeto(p).toLowerCase();
      const nomeOrientador = this.getOrientadorNome(p).toLowerCase();
      const campus = (p.campus || '').toLowerCase();
      const okTexto = !termo || nomeProjeto.includes(termo) || nomeOrientador.includes(termo) || campus.includes(termo);
      return okStatus && okTexto;
    });
  }

  trackByFn(index: number, p: Projeto) { return (p as any).id ?? index; }

  simularProgresso(i: number): number { const v = (i * 13) % 96; return Math.max(8, v + 4); }
  getCor(i: number): string { return this.cores[i % this.cores.length]; }

  temOrientador(p: any): boolean { return !!this.getOrientadorNome(p); }
  getOrientadorNome(p: any): string { return p?.nomeOrientador || p?.orientador_nome || p?.orientador?.nome || ''; }
  getNomeProjeto(p: any): string { return p?.nomeProjeto || p?.titulo_projeto || ''; }

  temAlunos(p: any): boolean {
    return (Array.isArray(p?.nomesAlunos) && p.nomesAlunos.length > 0) ||
           (Array.isArray(p?.alunos) && p.alunos.length > 0);
  }
  getQuantidadeAlunos(p: any): number {
    if (Array.isArray(p?.nomesAlunos)) return p.nomesAlunos.length;
    if (Array.isArray(p?.alunos)) return p.alunos.length;
    return 0;
  }

  editarProjeto(id?: number) {
    if (!id) return;
    this.router.navigate(['/orientador/projetos', id]);
  }

  excluirProjeto(_id?: number) {
    alert('Orientadores não podem excluir projetos. Procure a Secretaria.');
  }
}
