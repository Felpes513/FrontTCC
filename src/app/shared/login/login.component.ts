import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginService } from '@services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  senha = '';
  erro: string | null = null;
  perfil: 'aluno' | 'orientador' | 'secretaria' = 'aluno';

  showPassword = false;
  rememberMe = false;
  isLoading = false;

  constructor(
    private loginService: LoginService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.queryParams.subscribe((params) => {
      this.perfil = (params['perfil'] as any) || 'aluno';
      this.loadRememberedEmail();
    });
  }

  login() {
    this.erro = null;
    this.isLoading = true;

    let observable;
    if (this.perfil === 'aluno') {
      observable = this.loginService.loginAluno(this.email, this.senha);
    } else if (this.perfil === 'orientador') {
      observable = this.loginService.loginOrientador(this.email, this.senha);
    } else {
      // ⚠️ Só funciona se existir /login-secretaria no back
      observable = this.loginService.loginSecretaria(this.email, this.senha);
    }

    observable.subscribe({
      next: (res) => {
        this.loginService.setTokens(res.access_token, res.refresh_token);
        this.handleRememberMe();

        // ✅ usa o ROLE do JWT para decidir o destino
        const role = this.loginService.getRole();

        const redirects: Record<string, string> = {
          ALUNO: '/aluno/dashboard',            // ajuste se sua rota for outra
          ORIENTADOR: '/orientador/projetos',   // você já tem esta rota
          SECRETARIA: '/secretaria/projetos',   // você já tem esta rota
        };

        const destino = role ? redirects[role] : '/';
        this.isLoading = false;
        this.router.navigate([destino]);
      },
      error: (e) => {
        this.erro = e?.error?.detail || e?.error?.message || 'E-mail ou senha inválidos.';
        this.isLoading = false;
      },
    });
  }

  togglePassword() { this.showPassword = !this.showPassword; }

  forgotPassword(event: Event) {
    event.preventDefault();
    this.router.navigate(['/forgot-password'], { queryParams: { perfil: this.perfil } });
  }

  goToRegister() {
    if (this.perfil === 'aluno') {
      this.router.navigate(['/register/aluno']);
    } else if (this.perfil === 'orientador') {
      // se você tiver cadastro de orientador:
      this.router.navigate(['/cadastro'], { queryParams: { perfil: 'orientador' } });
    }
  }

  contactSupport(event: Event) {
    event.preventDefault();
    const supportEmails = {
      aluno: 'suporte.aluno@uscs.edu.br',
      orientador: 'suporte.orientador@uscs.edu.br',
      secretaria: 'suporte.secretaria@uscs.edu.br',
    } as const;

    const email = supportEmails[this.perfil];
    const subject = `Suporte - Login ${this.perfil.charAt(0).toUpperCase() + this.perfil.slice(1)}`;
    const body = `Olá, preciso de ajuda com o login como ${this.perfil}.`;

    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  }

  private handleRememberMe() {
    const storageKey = `rememberedEmail_${this.perfil}`;
    if (this.rememberMe) localStorage.setItem(storageKey, this.email);
    else localStorage.removeItem(storageKey);
  }

  private loadRememberedEmail() {
    const storageKey = `rememberedEmail_${this.perfil}`;
    const savedEmail = localStorage.getItem(storageKey);
    if (savedEmail) { this.email = savedEmail; this.rememberMe = true; }
  }
}
