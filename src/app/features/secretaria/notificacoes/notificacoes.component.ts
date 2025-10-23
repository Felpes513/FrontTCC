import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ProjetoService } from '@services/projeto.service';

interface Notificacao {
  tipo: string;
  mensagem: string;
  data: string;
  hora: string;
  lida: boolean;
  id?: number;
}

@Component({
  selector: 'app-notificacoes',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './notificacoes.component.html',
  styleUrls: ['./notificacoes.component.css'],
})
export class NotificacoesComponent implements OnInit {
  private readonly destinatario = 'secretaria';
  notificacoes: Notificacao[] = [];
  page = 1;
  size = 10;
  total = 0;
  totalPages = 1;
  carregando = false;
  erro: string | null = null;
  notificacaoAberta: Notificacao | null = null;

  constructor(private projetoService: ProjetoService) {}

  ngOnInit(): void {
    this.carregar(1);
  }

  private mapItem(n: any): Notificacao {
    const rawDate = n.data_criacao || n.created_at || n.data || n.timestamp;
    const d = rawDate ? new Date(rawDate) : new Date();
    return {
      tipo: n.titulo || n.tipo || 'Notificação',
      mensagem: n.mensagem || n.message || '',
      data: d.toLocaleDateString(),
      hora: d.toLocaleTimeString(),
      lida: !!n.lida,
      id: n.id,
    };
  }

  carregar(p = 1): void {
    this.carregando = true;
    this.erro = null;

    if ((this.projetoService as any).getNotificacoesPaginado) {
      this.projetoService
        .getNotificacoesPaginado(this.destinatario, p, this.size)
        .subscribe({
          next: (res: any) => {
            const items = res?.items ?? [];
            this.notificacoes = items.map((x: any) => this.mapItem(x));
            this.page = res?.page ?? p;
            this.size = res?.size ?? this.size;
            this.total = res?.total ?? items.length;
            this.totalPages = Math.max(1, Math.ceil(this.total / this.size));
            this.carregando = false;
          },
          error: () => {
            this.erro = 'Falha ao carregar notificações';
            this.carregando = false;
          },
        });
    } else {
      this.projetoService.getNotificacoes(this.destinatario).subscribe({
        next: (lista: any[]) => {
          const items = lista || [];
          this.total = items.length;
          this.totalPages = Math.max(1, Math.ceil(this.total / this.size));
          const start = (p - 1) * this.size;
          const end = start + this.size;
          this.notificacoes = items
            .slice(start, end)
            .map((x: any) => this.mapItem(x));
          this.page = p;
          this.carregando = false;
        },
        error: () => {
          this.erro = 'Falha ao carregar notificações';
          this.carregando = false;
        },
      });
    }
  }

  anterior(): void {
    if (this.page > 1) this.carregar(this.page - 1);
  }

  proxima(): void {
    if (this.page < this.totalPages) this.carregar(this.page + 1);
  }

  marcarTodasComoLidas(): void {
    if (!confirm('Marcar todas como lidas?')) return;
    this.notificacoes = this.notificacoes.map((n) => ({ ...n, lida: true }));
    if ((this.projetoService as any).marcarTodasComoLidas) {
      this.projetoService.marcarTodasComoLidas(this.destinatario).subscribe({
        next: () => this.carregar(this.page),
        error: () => {},
      });
    }
  }

  abrirNotificacao(notificacao: Notificacao): void {
    this.notificacaoAberta = notificacao;
    notificacao.lida = true;
  }

  fecharModal(): void {
    this.notificacaoAberta = null;
  }

  get novasNotificacoes(): boolean {
    return this.notificacoes.some((n) => !n.lida);
  }
}
