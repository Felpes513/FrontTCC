import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private readonly baseUrl = `${environment.apiBaseUrl}/notificacoes`;

  constructor(private http: HttpClient) {}

  getNotificacoes(destinatario: string): Observable<any[]> {
    const params = new HttpParams().set('destinatario', destinatario).set('page', 1).set('size', 1000);
    return this.http.get<any>(this.baseUrl, { params }).pipe(map(res => res.items ?? []));
  }

  getNotificacoesPaginado(destinatario: string, page = 1, size = 10): Observable<{items:any[], page:number, size:number, total:number}> {
    const params = new HttpParams()
      .set('destinatario', destinatario)
      .set('page', page)
      .set('size', size);
    return this.http.get<{items:any[], page:number, size:number, total:number}>(this.baseUrl, { params });
  }

  marcarTodasComoLidas(destinatario: string): Observable<any> {
    const params = new HttpParams().set('destinatario', destinatario);
    return this.http.put(`${this.baseUrl}/mark-all`, {}, { params });
  }
}
