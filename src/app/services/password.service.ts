import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PasswordService {
  private readonly apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Envia e-mail com link de redefinição
  forgotPassword(email: string): Observable<{ message?: string }> {
    return this.http.post<{ message?: string }>(`${this.apiUrl}/forgot-password`, { email });
  }

  // Confirma redefinição via token (fluxo do e-mail)
  resetPassword(token: string, novaSenha: string): Observable<{ message?: string }> {
    return this.http.post<{ message?: string }>(`${this.apiUrl}/reset-password`, {
      token,
      nova_senha: novaSenha,
    });
  }
}
