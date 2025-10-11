import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjetoService } from '@services/projeto.service';
import { ProjetoBasico, AvaliacaoEnvio } from '@interfaces/avaliacao';
import { AvaliadorExterno } from '@interfaces/avaliador_externo';

@Component({
  selector: 'app-enviar-avaliacoes-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enviar-avaliacoes.modal.html',
  styleUrls: ['./enviar-avaliacoes.modal.css'],
})
export class EnviarAvaliacoesModalComponent implements OnInit {
  @Input() avaliadores: AvaliadorExterno[] = [];
  @Output() closed = new EventEmitter<boolean>(); // true = recarregar

  carregando = false;
  erro: string | null = null;
  sucesso: string | null = null;

  projetos: ProjetoBasico[] = [];
  projetoSelecionado: string = ''; // '' → todos

  // multi-select de avaliadores quando "projeto único"
  avaliadoresSelecionados: number[] = [];

  constructor(private projService: ProjetoService) {}

  ngOnInit(): void {
    this.carregando = true;
    this.projService.listarProjetosParaAvaliacao().subscribe({
      next: (rows) => {
        this.projetos = rows || [];
        this.carregando = false;
      },
      error: (e) => {
        this.erro = e?.message || 'Falha ao carregar projetos';
        this.carregando = false;
      },
    });
  }

  fechar(ok = false) {
    this.closed.emit(ok);
  }

  toggleAvaliador(id: number, checked: boolean) {
    if (checked) {
      if (!this.avaliadoresSelecionados.includes(id))
        this.avaliadoresSelecionados.push(id);
    } else {
      this.avaliadoresSelecionados = this.avaliadoresSelecionados.filter(
        (x) => x !== id
      );
    }
  }

  onToggle(ev: Event, id: number) {
    const checked = (ev.target as HTMLInputElement)?.checked ?? false;
    this.toggleAvaliador(id, checked);
  }

  get podeEnviar(): boolean {
    if (!this.projetos.length) return false;

    if (!this.projetoSelecionado) return true;

    return this.avaliadoresSelecionados.length >= 2;
  }

  enviar() {
    this.erro = null;
    this.sucesso = null;

    const envios: AvaliacaoEnvio[] = [];

    if (!this.projetoSelecionado) {
      if (this.avaliadores.length < 2) {
        this.erro = 'É necessário ao menos dois avaliadores cadastrados.';
        return;
      }
      let idx = 0;
      for (const p of this.projetos) {
        const a1 = this.avaliadores[idx % this.avaliadores.length].id!;
        const a2 = this.avaliadores[(idx + 1) % this.avaliadores.length].id!;
        envios.push({ projetoId: p.id, avaliadorIds: [a1, a2] });
        idx += 2;
      }
    } else {
      const projetoId = Number(this.projetoSelecionado);
      const ids = this.avaliadoresSelecionados.slice(0, 2);
      envios.push({ projetoId, avaliadorIds: ids });
    }

    this.carregando = true;
    this.projService.enviarConvitesDeAvaliacao({ envios }).subscribe({
      next: (res) => {
        this.carregando = false;
        this.sucesso = res?.mensagem || 'Convites enviados.';
        setTimeout(() => this.fechar(true), 1200);
      },
      error: (e) => {
        this.carregando = false;
        this.erro = e?.error?.detail || 'Falha ao enviar convites.';
      },
    });
  }
}
