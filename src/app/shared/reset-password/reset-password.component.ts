import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PasswordService } from '@services/password.service';

type Perfil = 'aluno' | 'orientador' | 'secretaria';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent {
  perfil: Perfil = 'aluno';

  // modo 1 (solicitar link)
  email = '';

  // modo 2 (definir senha)
  token: string | null = null;
  novaSenha = '';
  confirmacao = '';
  show1 = false;
  show2 = false;

  loading = false;
  okMsg = '';
  erro = '';

  constructor(
    private pw: PasswordService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    const dataPerfil = (
      route.snapshot.data?.['perfil'] as string | undefined
    )?.toLowerCase();
    const qpPerfil = (
      route.snapshot.queryParamMap.get('perfil') || ''
    ).toLowerCase();
    const p = (dataPerfil || qpPerfil || 'aluno') as Perfil;
    if (p === 'orientador' || p === 'secretaria') this.perfil = p;

    // Se tiver token na URL, entramos no modo "confirmar nova senha"
    this.token = route.snapshot.queryParamMap.get('token');
  }

  // ----- Modo 1: solicitar link -----
  enviar() {
    this.resetMsgs();
    if (!this.email.trim()) {
      this.erro = 'Informe um e-mail.';
      return;
    }
    this.loading = true;
    this.pw.forgotPassword(this.email.trim()).subscribe({
      next: (r) => {
        this.okMsg = r?.message || 'Se o e-mail existir, enviaremos o link.';
        this.loading = false;
      },
      error: (e) => {
        this.erro = e?.error?.detail || 'Não foi possível enviar o link.';
        this.loading = false;
      },
    });
  }

  // ----- Modo 2: salvar nova senha -----
  senhaConfere(): boolean {
    return !!this.novaSenha && this.novaSenha === this.confirmacao;
  }

  strongEnough(): boolean {
    // regra mínima simples; ajuste se quiser força maior
    return this.novaSenha.length >= 8;
  }

  salvarNovaSenha() {
    this.resetMsgs();
    if (!this.token) {
      this.erro = 'Token ausente ou inválido.';
      return;
    }
    if (!this.senhaConfere() || !this.strongEnough()) {
      this.erro = 'Verifique a confirmação e os requisitos da senha.';
      return;
    }
    this.loading = true;
    this.pw.resetPassword(this.token, this.novaSenha).subscribe({
      next: (r) => {
        this.okMsg = r?.message || 'Senha redefinida com sucesso.';
        this.loading = false;
        // Opcional: após alguns segundos, ir para o login ou homepage
        // this.router.navigate(['/login']); // se preferir ir ao login
      },
      error: (e) => {
        this.erro = e?.error?.detail || 'Não foi possível redefinir a senha.';
        this.loading = false;
      },
    });
  }

  voltarLogin() {
    this.router.navigate(['/login'], { queryParams: { perfil: this.perfil } });
  }

  irParaLogin() {
    this.router.navigate(['/login']);
  }

  private resetMsgs() {
    this.okMsg = '';
    this.erro = '';
  }
}
