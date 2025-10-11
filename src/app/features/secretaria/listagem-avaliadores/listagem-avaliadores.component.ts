import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { faUsers, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AvaliadorExterno } from '@interfaces/avaliador_externo';
import { ProjetoService } from '@services/projeto.service';
import { EnviarAvaliacoesModalComponent } from "./enviar-avaliacoes.modal";

@Component({
  selector: 'app-listagem-avaliadores',
  standalone: true,
  imports: [CommonModule, RouterModule, EnviarAvaliacoesModalComponent],
  templateUrl: './listagem-avaliadores.component.html',
  styleUrls: ['./listagem-avaliadores.component.css']
})
export class ListagemAvaliadoresComponent implements OnInit {
  avaliadores: AvaliadorExterno[] = [];
  carregando = false;
  erro = '';
  showModal = false;

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

  abrirModal(){
    this.showModal = true;
  }
  onModalClosed(reload: boolean) {
    this.showModal = false;
    if (reload) this.carregar();
  }

  editar(a: AvaliadorExterno): void {
    this.router.navigate(['/secretaria/avaliadores/novo'], {
      state: { avaliador: a }
    });
  }

  excluir(id?: number): void {
    if (!id) return;
    if (!confirm('Deseja excluir este avaliador?')) return;

    this.service.deleteAvaliador(id).subscribe({
      next: () => {
        this.avaliadores = this.avaliadores.filter(av => av.id !== id);
      },
      error: (err) => alert(err?.message || 'Erro ao excluir')
    });
  }
}
