import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces para os dados de cadastro
interface RegisterOrientadorData {
  nomeCompleto: string;
  email: string;
  senha: string;
  cpf: string;
}

interface RegisterSecretariaData {
  nomeCompleto: string;
  email: string;
  senha: string;
}

// Interface para resposta do cadastro
interface RegisterResponse {
  message: string;
  id?: number;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) { }

  // Cadastro de orientador
  registerOrientador(data: RegisterOrientadorData): Observable<RegisterResponse> {
    const payload = {
      nome_completo: data.nomeCompleto,
      email: data.email,
      senha: data.senha,
      cpf: data.cpf.replace(/[^\d]/g, '') // Remove formatação do CPF
    };

    return this.http.post<RegisterResponse>(`${this.baseUrl}/register-orientador`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Cadastro de secretaria
  registerSecretaria(data: RegisterSecretariaData): Observable<RegisterResponse> {
    const payload = {
      nome_completo: data.nomeCompleto,
      email: data.email,
      senha: data.senha
    };

    return this.http.post<RegisterResponse>(`${this.baseUrl}/register-secretaria`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Verificar se e-mail já existe
  checkEmailExists(email: string, perfil: 'orientador' | 'secretaria'): Observable<{exists: boolean}> {
    return this.http.get<{exists: boolean}>(`${this.baseUrl}/check-email/${perfil}/${email}`);
  }

  // Verificar se CPF já existe (apenas para orientador)
  checkCPFExists(cpf: string): Observable<{exists: boolean}> {
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    return this.http.get<{exists: boolean}>(`${this.baseUrl}/check-cpf/${cleanCPF}`);
  }

  // Validar CPF no backend
  validateCPF(cpf: string): Observable<{valid: boolean}> {
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    return this.http.post<{valid: boolean}>(`${this.baseUrl}/validate-cpf`, { cpf: cleanCPF });
  }

  // Método auxiliar para validar força da senha
  validatePasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isValid: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    // Verifica comprimento mínimo
    if (password.length >= 8) {
      score++;
    } else {
      feedback.push('Senha deve ter pelo menos 8 caracteres');
    }

    // Verifica letras minúsculas
    if (/[a-z]/.test(password)) {
      score++;
    } else {
      feedback.push('Adicione pelo menos uma letra minúscula');
    }

    // Verifica letras maiúsculas
    if (/[A-Z]/.test(password)) {
      score++;
    } else {
      feedback.push('Adicione pelo menos uma letra maiúscula');
    }

    // Verifica números
    if (/[0-9]/.test(password)) {
      score++;
    } else {
      feedback.push('Adicione pelo menos um número');
    }

    // Verifica caracteres especiais
    if (/[^A-Za-z0-9]/.test(password)) {
      score++;
    } else {
      feedback.push('Adicione pelo menos um caractere especial (!@#$%^&*)');
    }

    return {
      score,
      feedback,
      isValid: score >= 3 // Considera válida se atender pelo menos 3 critérios
    };
  }
}
