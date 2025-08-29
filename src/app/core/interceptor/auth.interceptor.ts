// src/app/core/interceptor/auth.interceptor.ts
import { inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);

  const access = localStorage.getItem('access_token');
  const authReq = access ? req.clone({ setHeaders: { Authorization: `Bearer ${access}` } }) : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) return throwError(() => err);

      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) return throwError(() => err);

      return http.post<{ access_token: string; token_type: string }>(
        'http://127.0.0.1:8001/refresh-token',
        { refresh_token: refresh }
      ).pipe(
        switchMap(res => {
          localStorage.setItem('access_token', res.access_token);
          const retried = authReq.clone({ setHeaders: { Authorization: `Bearer ${res.access_token}` } });
          return next(retried);
        }),
        catchError(refreshErr => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('role');
          return throwError(() => refreshErr);
        })
      );
    })
  );
};
