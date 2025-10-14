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
    if (this.isLoading) return; // evita duplo clique
    this.erro = null;
    this.isLoading = true;

    const email = this.email.trim();
    const senha = this.senha;

    let observable;
    if (this.perfil === 'aluno') {
      observable = this.loginService.loginAluno(email, senha);
    } else if (this.perfil === 'orientador') {
      observable = this.loginService.loginOrientador(email, senha);
    } else {
      // enquanto SSO não estiver pronto, isso retornará 501
      observable = this.loginService.loginSecretaria(email, senha);
    }

    observable.subscribe({
      next: (res) => {
        this.loginService.setTokens(res.access_token, res.refresh_token);
        this.handleRememberMe();

        // debug opcional do payload:
        // console.log('payload', JSON.parse(atob(res.access_token.split('.')[1])));

        const role = this.loginService.getRole();
        console.log('[LOGIN OK] role extraída do JWT:', role);

        const redirects: Record<string, string> = {
          ALUNO: '/aluno/projetos',
          ORIENTADOR: '/orientador/projetos',
          SECRETARIA: '/secretaria/dashboard',
        };
        const destino = (role && redirects[role]) || '/';

        this.isLoading = false;
        this.router.navigateByUrl(destino);
      },
      error: (e) => {
        const status = e?.status;
        if (status === 501 && this.perfil === 'secretaria') {
          this.erro =
            "Login da Secretaria usa SSO. Clique em 'Entrar com SSO'.";
        } else {
          this.erro =
            e?.error?.detail ||
            e?.error?.message ||
            'E-mail ou senha inválidos.';
        }
        this.isLoading = false;
      },
    });
  }

  entrarComSSO() {
    window.location.href =
      'http://127.0.0.1:8001/sso/redirect?provider=empresa';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  forgotPassword(event: Event) {
    event.preventDefault();
    const map: Record<typeof this.perfil, string> = {
      aluno: '/aluno/reset-password',
      orientador: '/orientador/reset-password',
      secretaria: '/secretaria/reset-password',
    };
    this.router.navigate([map[this.perfil]]);
  }

  goToRegister() {
    if (this.perfil === 'aluno') {
      this.router.navigate(['/register/aluno']);
    } else if (this.perfil === 'orientador') {
      this.router.navigate(['/cadastro'], {
        queryParams: { perfil: 'orientador' },
      });
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
    const subject = `Suporte - Login ${
      this.perfil.charAt(0).toUpperCase() + this.perfil.slice(1)
    }`;
    const body = `Olá, preciso de ajuda com o login como ${this.perfil}.`;

    window.open(
      `mailto:${email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`
    );
  }

  private handleRememberMe() {
    const storageKey = `rememberedEmail_${this.perfil}`;
    if (this.rememberMe) localStorage.setItem(storageKey, this.email);
    else localStorage.removeItem(storageKey);
  }

  private loadRememberedEmail() {
    const storageKey = `rememberedEmail_${this.perfil}`;
    const savedEmail = localStorage.getItem(storageKey);
    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }
  }
}
