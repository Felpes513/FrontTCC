import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjetoService } from '../projeto.service'; // ajuste se necessário

interface Notificacao {
  tipo: string;
  mensagem: string;
  data: string;
  hora: string;
  lida: boolean;
}

@Component({
  selector: 'app-notificacoes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacoes.component.html',
  styleUrls: ['./notificacoes.component.css']
})
export class NotificacoesComponent implements OnInit {
  notificacoes: Notificacao[] = [];
  todasLidas: boolean = false;
  temNotificacoesNaoLidas: boolean = true;
  notificacaoAberta: Notificacao | null = null;

  constructor(private projetoService: ProjetoService) {}

  ngOnInit(): void {
    this.carregarNotificacoes();
  }

  carregarNotificacoes(): void {
    this.projetoService.getNotificacoes('secretaria').subscribe({
      next: (lista) => {
        this.notificacoes = lista.map(n => {
          const dataHora = new Date(n.data_criacao);
          return {
            tipo: n.tipo,
            mensagem: n.mensagem,
            data: dataHora.toLocaleDateString(),
            hora: dataHora.toLocaleTimeString(),
            lida: n.lida
          };
        });
        this.temNotificacoesNaoLidas = this.novasNotificacoes;
        console.log('✅ Notificações recebidas:', this.notificacoes);
      },
      error: (err) => {
        console.error('❌ Erro ao buscar notificações:', err);
      }
    });
  }

  marcarTodasComoLidas(): void {
    this.notificacoes.forEach(n => n.lida = true);
    this.todasLidas = true;
    this.temNotificacoesNaoLidas = false;
  }

  get novasNotificacoes(): boolean {
    return this.notificacoes.some(n => !n.lida);
  }

  abrirNotificacao(notificacao: Notificacao): void {
    this.notificacaoAberta = notificacao;
    notificacao.lida = true;
  }

  fecharModal(): void {
    this.notificacaoAberta = null;
  }
}
