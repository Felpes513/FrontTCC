// src/app/services/cadastro.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  RegisterResponse,
  RegisterAlunoData,
  RegisterOrientadorData,
  RegisterSecretariaData
} from '@interfaces/registros';

@Injectable({ providedIn: 'root' })
export class RegisterService {
  private baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  registerAluno(data: RegisterAlunoData): Observable<RegisterResponse> {
    const payload = {
      nome_completo: data.nomeCompleto,
      cpf: this.cleanCPF(data.cpf),
      curso: data.curso,
      campus: data.campus,
      email: data.email,
      senha: data.senha,
    };
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register/aluno`, payload);
  }

  registerOrientador(data: RegisterOrientadorData): Observable<RegisterResponse> {
    const payload: any = {
      nome_completo: data.nomeCompleto,
      email: data.email,
      senha: data.senha,
      cpf: this.cleanCPF(data.cpf),
    };
    if ((data as any).campus) payload.campus = (data as any).campus;
    if ((data as any).especialidade) payload.especialidade = (data as any).especialidade;

    return this.http.post<RegisterResponse>(`${this.baseUrl}/register-orientador`, payload);
  }

  checkEmailExists(email: string, perfil: 'orientador' | 'secretaria'): Observable<{ exists: boolean }> {
    const params = new HttpParams().set('perfil', perfil).set('email', email);
    return this.http.get<{ exists: boolean }>(`${this.baseUrl}/check-email`, { params });
  }

  checkCPFExists(cpf: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.baseUrl}/check-cpf/${this.cleanCPF(cpf)}`);
  }

  validateCPF(cpf: string): Observable<{ valid: boolean }> {
    return this.http.post<{ valid: boolean }>(`${this.baseUrl}/validate-cpf`, { cpf: this.cleanCPF(cpf) });
  }

  private cleanCPF(cpf: string) {
    return cpf.replace(/[^\d]/g, '');
  }

  validatePasswordStrength(password: string): { score: number; feedback: string[]; isValid: boolean } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++; else feedback.push('Senha deve ter pelo menos 8 caracteres');
    if (/[a-z]/.test(password)) score++; else feedback.push('Adicione pelo menos uma letra minúscula');
    if (/[A-Z]/.test(password)) score++; else feedback.push('Adicione pelo menos uma letra maiúscula');
    if (/[0-9]/.test(password)) score++; else feedback.push('Adicione pelo menos um número');
    if (/[^A-Za-z0-9]/.test(password)) score++; else feedback.push('Adicione pelo menos um caractere especial (!@#$%^&*)');

    return { score, feedback, isValid: score >= 3 };
  }
}
