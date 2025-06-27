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

  constructor(
    private projetoService: ProjetoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.projetoService.listarProjetos().subscribe((projetos) => {
      console.log('Projetos recebidos:', projetos);
      this.projetos = projetos;
      
      // Debug: Verificar se os projetos têm ID
      this.projetos.forEach((projeto, index) => {
        console.log(`Projeto ${index}:`, {
          id: projeto.id,
          nome: projeto.nomeProjeto,
          hasId: !!projeto.id
        });
      });
    });
  }

  // REMOVIDO o método duplicado - mantendo apenas este
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
          console.log('Projeto excluído com sucesso');
          // Remover o item do array local
          this.projetos = this.projetos.filter(p => p.id !== id);
          alert('Projeto excluído com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao excluir projeto:', error);
          alert('Erro ao excluir projeto');
        }
      });
    }
  }

  editarProjeto(id: number): void {
    console.log('Navegando para editar projeto ID:', id);
    this.router.navigate(['/secretaria/projetos/editar', id]);
  }
}