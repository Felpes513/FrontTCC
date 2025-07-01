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
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  senha = '';
  erro: string | null = null;
  perfil: 'aluno' | 'orientador' | 'secretaria' = 'aluno';

  constructor(
    private loginService: LoginService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.queryParams.subscribe(params => {
      this.perfil = params['perfil'] || 'aluno';
    });
  }

  login() {
    this.erro = null;

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

        const redirect = this.perfil === 'aluno'
          ? '/aluno/dashboard'
          : this.perfil === 'orientador'
          ? '/orientador/dashboard'
          : '/secretaria/projetos';

        this.router.navigate([redirect]);
      },
      error: () => {
        this.erro = 'E-mail ou senha inválidos.';
      }
    });
  }
}
