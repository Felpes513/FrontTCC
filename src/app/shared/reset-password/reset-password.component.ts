import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ConfigService } from '@services/config.service';

type Perfil = 'aluno'|'orientador'|'secretaria';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  perfil: Perfil = 'aluno';
  email = '';
  loading = false;
  okMsg = '';
  erro = '';

  constructor(
    private cfg: ConfigService,
    route: ActivatedRoute,
    private router: Router
  ) {
    const dataPerfil = (route.snapshot.data?.['perfil'] as string|undefined)?.toLowerCase();
    const qpPerfil = (route.snapshot.queryParamMap.get('perfil') || '').toLowerCase();

    const p = (dataPerfil || qpPerfil || 'aluno');
    if (p === 'orientador' || p === 'secretaria') this.perfil = p as Perfil;
  }

  enviar() {
    this.okMsg = this.erro = '';
    if (!this.email.trim()) { this.erro = 'Informe um e-mail.'; return; }
    this.loading = true;
    this.cfg.forgotPassword(this.email.trim()).subscribe({
      next: (r: any) => { this.okMsg = r?.message || 'Se o e-mail existir, enviaremos o link.'; this.loading = false; },
      error: (e: any) => { this.erro = e?.error?.detail || 'Não foi possível enviar o link.'; this.loading = false; }
    });
  }

  voltarLogin() {
    this.router.navigate(['/login'], { queryParams: { perfil: this.perfil }});
  }
}
