import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from './login.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  // Novas propriedades adicionadas
  showPassword: boolean = false;
  rememberMe: boolean = false;
  isLoading: boolean = false;

  constructor(
    private loginService: LoginService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.queryParams.subscribe((params) => {
      this.perfil = params['perfil'] || 'aluno';
      this.loadRememberedEmail();
    });
  }

  login() {
    this.erro = null;
    this.isLoading = true;

    console.log('Perfil detectado:', this.perfil);

    let observable;

    if (this.perfil === 'aluno') {
      observable = this.loginService.loginAluno(this.email, this.senha);
    } else if (this.perfil === 'orientador') {
      observable = this.loginService.loginOrientador(this.email, this.senha);
    } else {
      observable = this.loginService.loginSecretaria(this.email, this.senha);
    }

    observable.subscribe({
      next: (res) => {
        this.loginService.setTokens(res.access_token, res.refresh_token);

        // Salvar email se "lembrar de mim" estiver ativado
        this.handleRememberMe();

        const redirects = {
          aluno: '/aluno/dashboard',
          orientador: '/orientador/dashboard',
          secretaria: '/secretaria/projetos',
        };

        this.router.navigate([redirects[this.perfil]]);
      },
      error: () => {
        this.erro = 'E-mail ou senha inválidos.';
        this.isLoading = false;
      },
    });
  }

  // Toggle para mostrar/ocultar senha
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // Navegar para página de esqueci a senha
  forgotPassword(event: Event) {
    event.preventDefault();

    // Navegar baseado no perfil atual
    const forgotPasswordRoute = `/forgot-password?perfil=${this.perfil}`;
    this.router.navigate(['/forgot-password'], {
      queryParams: { perfil: this.perfil },
    });
  }

  // Navegar para página de cadastro
  goToRegister() {
    if (this.perfil === 'aluno') {
      this.router.navigate(['/register/aluno']);
    }
  }
  // Contatar suporte
  contactSupport(event: Event) {
    event.preventDefault();

    // Opção 1: Abrir email
    const supportEmails = {
      aluno: 'suporte.aluno@uscs.edu.br',
      orientador: 'suporte.orientador@uscs.edu.br',
      secretaria: 'suporte.secretaria@uscs.edu.br',
    };

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

    // Opção 2: Navegar para página de suporte
    // this.router.navigate(['/support'], { queryParams: { perfil: this.perfil } });

    // Opção 3: Abrir modal de suporte
    // console.log(`Contato de suporte para perfil: ${this.perfil}`);
  }

  // Gerenciar "lembrar de mim"
  private handleRememberMe() {
    const storageKey = `rememberedEmail_${this.perfil}`;

    if (this.rememberMe) {
      localStorage.setItem(storageKey, this.email);
    } else {
      localStorage.removeItem(storageKey);
    }
  }

  // Carregar email salvo
  private loadRememberedEmail() {
    const storageKey = `rememberedEmail_${this.perfil}`;
    const savedEmail = localStorage.getItem(storageKey);

    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }
  }
}
