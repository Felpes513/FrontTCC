import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterService } from '@services/cadastro.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class RegisterComponent {
  nomeCompleto = '';
  cpf = '';
  curso = '';
  campus = '';
  email = '';
  senha = '';
  confirmarSenha = '';

  // Controles do formulário
  erro: string | null = null;
  sucesso: string | null = null;
  readonly perfil: 'aluno' = 'aluno';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;
  acceptTerms: boolean = false;

  constructor(
    private registerService: RegisterService,
    private router: Router
  ) {}

  register() {
    this.erro = null;
    this.sucesso = null;
    this.isLoading = true;

    // Validação do formulário
    if (!this.validateForm()) {
      this.isLoading = false;
      return;
    }

    this.registerService.registerAluno({
      nomeCompleto: this.nomeCompleto,
      cpf: this.cpf,
      curso: this.curso,
      campus: this.campus,
      email: this.email,
      senha: this.senha
    }).subscribe({
      next: () => {
        this.sucesso = 'Cadastro realizado com sucesso! Redirecionando para o login...';
        setTimeout(() => {
          this.router.navigate(['/login'], { queryParams: { perfil: 'aluno' } });
        }, 2000);
      },
      error: (error) => {
        console.error('Erro no cadastro:', error);

        if (error.status === 400) {
          this.erro = 'Dados inválidos. Verifique as informações inseridas.';
        } else if (error.status === 409) {
          this.erro = 'E-mail já cadastrado no sistema.';
        } else if (error.status === 422) {
          this.erro = 'Preencha todos os campos corretamente.';
        } else {
          this.erro = 'Erro interno do servidor. Tente novamente mais tarde.';
        }

        this.isLoading = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.nomeCompleto.trim()) {
      this.erro = 'Nome completo é obrigatório.';
      return false;
    }

    if (this.nomeCompleto.trim().length < 3) {
      this.erro = 'Nome completo deve ter pelo menos 3 caracteres.';
      return false;
    }

    if (!this.email.trim()) {
      this.erro = 'E-mail é obrigatório.';
      return false;
    }

    if (!this.isValidEmail(this.email)) {
      this.erro = 'E-mail deve ter um formato válido.';
      return false;
    }

    if (!this.senha) {
      this.erro = 'Senha é obrigatória.';
      return false;
    }

    if (this.senha.length < 6) {
      this.erro = 'Senha deve ter pelo menos 6 caracteres.';
      return false;
    }

    if (this.senha !== this.confirmarSenha) {
      this.erro = 'As senhas não coincidem.';
      return false;
    }

    if (!this.acceptTerms) {
      this.erro = 'Você deve aceitar os termos de uso.';
      return false;
    }

    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToLogin() {
    this.router.navigate(['/login'], { queryParams: { perfil: 'aluno' } });
  }

  contactSupport(event: Event) {
    event.preventDefault();

    const email = 'suporte.aluno@uscs.edu.br';
    const subject = 'Suporte - Cadastro Aluno';
    const body = 'Olá, preciso de ajuda com o cadastro como aluno.';

    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  }

  getPasswordStrength(): string {
    if (!this.senha) return '';

    let strength = 0;
    if (this.senha.length >= 8) strength++;
    if (/[a-z]/.test(this.senha)) strength++;
    if (/[A-Z]/.test(this.senha)) strength++;
    if (/[0-9]/.test(this.senha)) strength++;
    if (/[^A-Za-z0-9]/.test(this.senha)) strength++;

    if (strength < 2) return 'fraca';
    if (strength < 4) return 'média';
    return 'forte';
  }
}
