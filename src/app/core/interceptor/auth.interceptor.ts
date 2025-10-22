// src/app/core/interceptor/auth.interceptor.ts
import { inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpBackend,
  HttpHandlerFn,
} from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_BASE = environment.apiUrl.replace(/\/+$/, ''); // sem barra no fim
const REFRESH_URL = `${API_BASE}/refresh-token`;

function normalizePath(u: string): string {
  try {
    if (u.startsWith('http')) {
      const parsed = new URL(u, window.location.origin);
      return parsed.pathname; // '/api/...'
    }
    return u;
  } catch {
    return u;
  }
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const backend = inject(HttpBackend);
  const rawHttp = new HttpClient(backend);

  const path = normalizePath(req.url);

  // É chamada da API se:
  // 1) URL absoluta inicia com API_BASE, ou
  // 2) caminho começa com '/api/'
  const isApi =
    req.url.startsWith(API_BASE) ||
    path.startsWith('/api/');

  // Endpoints que NÃO recebem Authorization
  const isAuthEndpoint =
    path.startsWith('/api/login') ||
    path.startsWith('/api/login-') ||
    path.startsWith('/api/secretarias/login') ||
    path.startsWith('/api/forgot-password') ||
    path.startsWith('/api/reset-password') ||
    req.url === REFRESH_URL ||
    path === '/api/refresh-token';

  const access = localStorage.getItem('access_token');

  const authReq =
    access && isApi && !isAuthEndpoint
      ? req.clone({ setHeaders: { Authorization: `Bearer ${access}` } })
      : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || isAuthEndpoint) {
        return throwError(() => err);
      }

      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        return throwError(() => err);
      }

      // Tenta refresh SEM Authorization
      return rawHttp
        .post<{ access_token: string; token_type?: string }>(REFRESH_URL, {
          refresh_token: refresh,
        })
        .pipe(
          switchMap((res) => {
            const newAccess = res?.access_token;
            if (!newAccess) throw err;
            localStorage.setItem('access_token', newAccess);
            const retried = req.clone({
              setHeaders: { Authorization: `Bearer ${newAccess}` },
            });
            return next(retried);
          }),
          catchError((refreshErr) => {
            // limpa sessão
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('role');
            return throwError(() => refreshErr);
          })
        );
    })
  );
};
