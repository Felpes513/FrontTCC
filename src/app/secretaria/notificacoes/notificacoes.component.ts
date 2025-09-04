import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacoesService, Notificacao } from '@services/notificacoes.service';

@Component({
  selector: 'app-notificacoes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacoes.component.html',
  styleUrls: ['./notificacoes.component.css']
})
export class NotificacoesComponent implements OnInit {
  private readonly destinatario = 'secretaria';

  notificacoes: (Notificacao & { data: string; hora: string })[] = [];

  page = 1;
  size = 10;
  total = 0;
  totalPages = 1;

  carregando = false;
  erro: string | null = null;

  notificacaoAberta: (Notificacao & { data: string; hora: string }) | null = null;

  constructor(private notifService: NotificacoesService) {}

  ngOnInit(): void {
    // reage a mudanças (quando novas notificações forem criadas em runtime)
    this.notifService.observe(this.destinatario).subscribe(() => {
      this.carregar(this.page);
    });
    this.carregar(1);
  }

  private mapItem(n: Notificacao) {
    const d = new Date(n.dataISO);
    return {
      ...n,
      data: d.toLocaleDateString(),
      hora: d.toLocaleTimeString(),
    };
  }

  carregar(p = 1): void {
    this.carregando = true;
    this.erro = null;
    try {
      const res = this.notifService.paginate(this.destinatario, p, this.size);
      this.notificacoes = res.items.map(n => this.mapItem(n));
      this.page = res.page;
      this.size = res.size;
      this.total = res.total;
      this.totalPages = res.totalPages;
    } catch (e) {
      console.error('❌ Erro ao carregar notificações:', e);
      this.erro = 'Falha ao carregar notificações';
    } finally {
      this.carregando = false;
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
    this.notifService.markAllRead(this.destinatario);
    this.carregar(this.page);
  }

  abrirNotificacao(notificacao: Notificacao & { data: string; hora: string }): void {
    this.notificacaoAberta = notificacao;
    // marca visualmente e persiste
    if (!notificacao.lida) {
      const all = this.notifService.snapshot(this.destinatario);
      const idx = all.findIndex(n => n.id === notificacao.id);
      if (idx >= 0) {
        all[idx] = { ...all[idx], lida: true };
        // salva e notifica (jeito simples: clear+readd)
        this.notifService.clear(this.destinatario);
        all.sort((a, b) => (b.id - a.id));
        for (const n of all) {
          this.notifService.add(this.destinatario, {
            tipo: n.tipo,
            mensagem: n.mensagem,
            dataISO: n.dataISO,
            lida: n.lida
          });
        }
      }
    }
  }

  fecharModal(): void {
    this.notificacaoAberta = null;
  }

  get novasNotificacoes(): boolean {
    return this.notificacoes.some(n => !n.lida);
  }
}
