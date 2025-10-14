import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  RegisterResponse,
  RegisterAlunoData,
  RegisterOrientadorData,
  RegisterSecretariaData
} from '@interfaces/registros';

@Injectable({ providedIn: 'root' })
export class RegisterService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  // ALUNO -> Backend /alunos/ (multipart + PDF)
  registerAluno(data: RegisterAlunoData & { idCurso: number; pdf: File }): Observable<RegisterResponse> {
    const fd = new FormData();
    fd.append('nome_completo', data.nomeCompleto);
    fd.append('email', data.email);
    fd.append('cpf', this.cleanCPF(data.cpf));
    fd.append('id_curso', String(data.idCurso));
    fd.append('senha', data.senha);
    fd.append('pdf', data.pdf, data.pdf.name);
    return this.http.post<RegisterResponse>(`${this.baseUrl}/alunos/`, fd);
  }

  // ORIENTADOR -> Backend /orientadores/
  registerOrientador(data: RegisterOrientadorData): Observable<RegisterResponse> {
    const payload = {
      nome_completo: data.nomeCompleto,
      email: data.email,
      cpf: this.cleanCPF(data.cpf),
      senha: data.senha,
    };
    return this.http.post<RegisterResponse>(`${this.baseUrl}/orientadores/`, payload);
  }

  // (mantive utilidades que você já tinha; use quando precisar)
  checkEmailExists(email: string, perfil: 'orientador' | 'secretaria'): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.baseUrl}/check-email`, { params: { perfil, email } });
  }
  checkCPFExists(cpf: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.baseUrl}/check-cpf/${this.cleanCPF(cpf)}`);
  }
  validateCPF(cpf: string): Observable<{ valid: boolean }> {
    return this.http.post<{ valid: boolean }>(`${this.baseUrl}/validate-cpf`, { cpf: this.cleanCPF(cpf) });
  }

  private cleanCPF(cpf: string) { return cpf.replace(/[^\d]/g, ''); }

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
