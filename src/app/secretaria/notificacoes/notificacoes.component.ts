import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjetoService } from '../../services/projeto.service';

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
  imports: [CommonModule],
  templateUrl: './notificacoes.component.html',
  styleUrls: ['./notificacoes.component.css']
})
export class NotificacoesComponent implements OnInit {
  // caixa da secretaria; ajuste para o identificador correto
  private readonly destinatario = 'secretaria';

  notificacoes: Notificacao[] = [];
  paginaAtual: Notificacao[] = [];

  // paginação client-side
  page = 1;
  size = 10;
  totalPages = 1;

  notificacaoAberta: Notificacao | null = null;

  constructor(private projetoService: ProjetoService) {}

  ngOnInit(): void {
    this.carregarNotificacoes();
  }

  carregarNotificacoes(): void {
    this.projetoService.getNotificacoes(this.destinatario).subscribe({
      next: (lista) => {
        this.notificacoes = (lista || []).map((n: any) => {
          const dataHora = new Date(n.data_criacao);
          return {
            tipo: n.tipo,
            mensagem: n.mensagem,
            data: dataHora.toLocaleDateString(),
            hora: dataHora.toLocaleTimeString(),
            lida: !!n.lida,
            id: n.id
          };
        });
        this.recalcularPaginacao(1);
      },
      error: (err) => console.error('❌ Erro ao buscar notificações:', err)
    });
  }

  // ===== Paginação client-side =====
  private fatiar(p: number): void {
    const start = (p - 1) * this.size;
    const end = start + this.size;
    this.paginaAtual = this.notificacoes.slice(start, end);
  }

  private recalcularPaginacao(p: number): void {
    this.totalPages = Math.max(1, Math.ceil(this.notificacoes.length / this.size));
    this.page = Math.min(Math.max(1, p), this.totalPages);
    this.fatiar(this.page);
  }

  anterior(): void {
    if (this.page > 1) this.recalcularPaginacao(this.page - 1);
  }

  proxima(): void {
    if (this.page < this.totalPages) this.recalcularPaginacao(this.page + 1);
  }

  marcarTodasComoLidas(): void {
    if (!confirm('Marcar todas como lidas?')) return;

    this.notificacoes = this.notificacoes.map(n => ({ ...n, lida: true }));
    this.fatiar(this.page);

    if ((this.projetoService as any).marcarTodasComoLidas) {
      this.projetoService.marcarTodasComoLidas(this.destinatario).subscribe({
        error: (err) => console.warn('Falha ao persistir "lidas":', err)
      });
    }
  }

  abrirNotificacao(notificacao: Notificacao): void {
    this.notificacaoAberta = notificacao;
    // marca visualmente como lida
    notificacao.lida = true;
  }

  fecharModal(): void {
    this.notificacaoAberta = null;
  }

  get novasNotificacoes(): boolean {
    return this.notificacoes.some(n => !n.lida);
  }
}
