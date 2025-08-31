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

const REFRESH_URL = '/api/refresh-token';

function normalizePath(u: string): string {
  try {
    return u.startsWith('http')
      ? new URL(u, window.location.origin).pathname
      : u;
  } catch {
    return u;
  }
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  // HttpClient que bypassa interceptors (para o refresh)
  const backend = inject(HttpBackend);
  const rawHttp = new HttpClient(backend);

  const path = normalizePath(req.url);
  const isApi = path.startsWith('/api/');
  const isAuthEndpoint =
    path.startsWith('/api/login') ||
    path.startsWith('/api/login-') ||
    path.startsWith('/api/secretarias/login') || // ← add
    path === REFRESH_URL;
  const access = localStorage.getItem('access_token');

  if (access && isApi && !isAuthEndpoint) {
    console.debug('[AUTH-INT] Authorization anexado em', path);
  }

  const authReq =
    access && isApi && !isAuthEndpoint
      ? req.clone({ setHeaders: { Authorization: `Bearer ${access}` } })
      : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // não tenta refresh se o 401 veio de login/refresh
      if (err.status !== 401 || isAuthEndpoint) {
        return throwError(() => err);
      }

      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        console.debug('[AUTH-INT] 401 sem refresh_token → abort');
        return throwError(() => err);
      }

      console.debug('[AUTH-INT] 401 em', path, '→ tentando refresh');

      // refresh SEM Authorization
      return rawHttp
        .post<{ access_token: string; token_type: string }>(REFRESH_URL, {
          refresh_token: refresh,
        })
        .pipe(
          switchMap((res) => {
            if (!res?.access_token) {
              console.debug('[AUTH-INT] refresh sem access_token');
              throw err;
            }
            localStorage.setItem('access_token', res.access_token);
            const retried = req.clone({
              setHeaders: { Authorization: `Bearer ${res.access_token}` },
            });
            console.debug('[AUTH-INT] refresh OK, re-tentando', path);
            return next(retried);
          }),
          catchError((refreshErr) => {
            console.debug('[AUTH-INT] refresh falhou → limpando storage');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('role');
            return throwError(() => refreshErr);
          })
        );
    })
  );
};
