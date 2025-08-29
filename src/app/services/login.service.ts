import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

type Role = 'SECRETARIA' | 'ORIENTADOR' | 'ALUNO';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  loginAluno(email: string, senha: string): Observable<LoginResponse> {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', senha);
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/login`,
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
  }

  loginOrientador(email: string, senha: string): Observable<LoginResponse> {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', senha);
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/login-orientador`,
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
  }

  loginSecretaria(email: string, senha: string): Observable<LoginResponse> {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', senha);
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/login-secretaria`,
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);

    const role = this.decodeRoleFromJwt(accessToken);
    if (role) localStorage.setItem('role', role);
  }

  getRole(): Role | null {
    const r = localStorage.getItem('role');
    return r === 'SECRETARIA' || r === 'ORIENTADOR' || r === 'ALUNO' ? (r as Role) : null;
  }

  private decodeRoleFromJwt(token: string): Role | null {
    try {
      const payload = JSON.parse(this.base64UrlDecode(token.split('.')[1] || ''));
      const raw = (payload.role || payload.roles?.[0] || payload.authorities?.[0]) as string | undefined;
      if (!raw) return null;
      const upper = raw.toUpperCase();
      return ['SECRETARIA', 'ORIENTADOR', 'ALUNO'].includes(upper) ? (upper as Role) : null;
    } catch {
      return null;
    }
  }

  private base64UrlDecode(s: string) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    const pad = s.length % 4 ? 4 - (s.length % 4) : 0;
    return decodeURIComponent(
      atob(s + '='.repeat(pad))
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  }
}
