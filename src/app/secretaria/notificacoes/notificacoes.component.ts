import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  ngOnInit(): void {
    this.notificacoes = [
      {
        tipo: 'Atualização de Projeto',
        mensagem: 'Projeto P-001 SGPIC foi atualizado.',
        data: '09/07/2025',
        hora: '15:21',
        lida: false
      },
      {
        tipo: 'Aprovação de Aluno',
        mensagem: 'Aluno Felipe Souza Moreira foi aprovado com sucesso.',
        data: '09/07/2025',
        hora: '15:22',
        lida: false
      }
    ];

    this.temNotificacoesNaoLidas = this.novasNotificacoes;
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
