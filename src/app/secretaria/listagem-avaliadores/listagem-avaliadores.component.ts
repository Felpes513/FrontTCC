import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUsers, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ProjetoService, AvaliadorExterno } from '../../services/projeto.service';

@Component({
  selector: 'app-listagem-avaliadores',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './listagem-avaliadores.component.html',
  styleUrls: ['./listagem-avaliadores.component.css']
})
export class ListagemAvaliadoresComponent implements OnInit {
  avaliadores: AvaliadorExterno[] = [];
  carregando = false;
  erro = '';

  // ícones
  icUsers = faUsers;
  icPlus = faPlus;
  icEdit = faEdit;
  icTrash = faTrash;

  constructor(
    private service: ProjetoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregar();
      if (history.state?.reload) this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = '';
    this.service.listarAvaliadoresExternos().subscribe({
      next: (lista) => {
        // garante compat com back que pode retornar 'link_lattes'
        this.avaliadores = (lista || []).map(a => ({
          ...a,
          link_lattes: (a as any).link_lattes ?? (a as any).lattes_link ?? ''
        }));
        this.carregando = false;
      },
      error: (err) => {
        this.erro = err?.message || 'Falha ao carregar avaliadores';
        this.carregando = false;
      }
    });
  }

  editar(a: AvaliadorExterno): void {
    // Navega para o formulário reutilizando o mesmo componente de "novo"
    this.router.navigate(['/secretaria/avaliadores/novo'], {
      state: { avaliador: a }
    });
  }

  excluir(id?: number): void {
    if (!id) return;
    if (!confirm('Deseja excluir este avaliador?')) return;

    this.service.deleteAvaliador(id).subscribe({
      next: () => {
        // Remove da lista sem recarregar tudo
        this.avaliadores = this.avaliadores.filter(av => av.id !== id);
      },
      error: (err) => alert(err?.message || 'Erro ao excluir')
    });
  }
}
