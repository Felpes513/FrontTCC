import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RegisterService } from './cadastro.service';
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
  // Dados comuns
  nomeCompleto = '';
  email = '';
  senha = '';
  confirmarSenha = '';

  // Dados específicos do orientador
  cpf = '';

  // Controles do formulário
  erro: string | null = null;
  sucesso: string | null = null;
  perfil: 'orientador' | 'secretaria' = 'orientador';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;
  acceptTerms: boolean = false;

  constructor(
    private registerService: RegisterService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.queryParams.subscribe(params => {
      this.perfil = params['perfil'] || 'orientador';
    });
  }

  register() {
    this.erro = null;
    this.sucesso = null;
    this.isLoading = true;

    // Validações
    if (!this.validateForm()) {
      this.isLoading = false;
      return;
    }

    console.log('Cadastro para perfil:', this.perfil);

    let observable;

    if (this.perfil === 'orientador') {
      observable = this.registerService.registerOrientador({
        nomeCompleto: this.nomeCompleto,
        email: this.email,
        senha: this.senha,
        cpf: this.cpf
      });
    } else {
      observable = this.registerService.registerSecretaria({
        nomeCompleto: this.nomeCompleto,
        email: this.email,
        senha: this.senha
      });
    }

    observable.subscribe({
      next: (res) => {
        this.sucesso = 'Cadastro realizado com sucesso! Redirecionando para o login...';

        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: { perfil: this.perfil }
          });
        }, 2000);
      },
      error: (error) => {
        console.error('Erro no cadastro:', error);

        // Tratar diferentes tipos de erro
        if (error.status === 400) {
          this.erro = 'Dados inválidos. Verifique as informações inseridas.';
        } else if (error.status === 409) {
          this.erro = 'E-mail já cadastrado no sistema.';
        } else if (error.status === 422) {
          this.erro = 'Dados inválidos. Verifique se todos os campos estão preenchidos corretamente.';
        } else {
          this.erro = 'Erro interno do servidor. Tente novamente mais tarde.';
        }

        this.isLoading = false;
      }
    });
  }

  // Validações do formulário
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
      this.erro = 'Senhas não coincidem.';
      return false;
    }

    if (this.perfil === 'orientador') {
      if (!this.cpf.trim()) {
        this.erro = 'CPF é obrigatório para orientadores.';
        return false;
      }

      if (!this.isValidCPF(this.cpf)) {
        this.erro = 'CPF deve ter um formato válido.';
        return false;
      }
    }

    if (!this.acceptTerms) {
      this.erro = 'Você deve aceitar os termos de uso.';
      return false;
    }

    return true;
  }

  // Validar formato de e-mail
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar CPF
  isValidCPF(cpf: string): boolean {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) {
      return false;
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    // Validação do algoritmo do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  // Formatar CPF conforme digitação
  formatCPF(event: any) {
    let value = event.target.value.replace(/[^\d]/g, '');

    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    this.cpf = value;
  }

  // Toggle para mostrar/ocultar senha
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // Toggle para mostrar/ocultar confirmação de senha
  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Voltar para o login
  goToLogin() {
    this.router.navigate(['/login'], {
      queryParams: { perfil: this.perfil }
    });
  }

  // Contatar suporte
  contactSupport(event: Event) {
    event.preventDefault();

    const supportEmails = {
      orientador: 'suporte.orientador@uscs.edu.br',
      secretaria: 'suporte.secretaria@uscs.edu.br'
    };

    const email = supportEmails[this.perfil];
    const subject = `Suporte - Cadastro ${this.perfil.charAt(0).toUpperCase() + this.perfil.slice(1)}`;
    const body = `Olá, preciso de ajuda com o cadastro como ${this.perfil}.`;

    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  }

  // Verificar força da senha
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
