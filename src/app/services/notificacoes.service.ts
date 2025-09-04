import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notificacao {
  id: number;
  destinatario: string;
  tipo: string;
  mensagem: string;
  dataISO: string;
  lida: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificacoesService {
  private storageKey(destinatario: string) { return `notif:${destinatario}`; }

  private subjects: Record<string, BehaviorSubject<Notificacao[]>> = {};

  private ensure(destinatario: string) {
    if (!this.subjects[destinatario]) {
      const initial = this.load(destinatario);
      this.subjects[destinatario] = new BehaviorSubject<Notificacao[]>(initial);
    }
    return this.subjects[destinatario];
  }

  private load(destinatario: string): Notificacao[] {
    const raw = localStorage.getItem(this.storageKey(destinatario));
    try { return raw ? JSON.parse(raw) : []; } catch { return []; }
  }

  private save(destinatario: string, list: Notificacao[]) {
    localStorage.setItem(this.storageKey(destinatario), JSON.stringify(list));
  }

  observe(destinatario: string) {
    return this.ensure(destinatario).asObservable();
  }

  snapshot(destinatario: string): Notificacao[] {
    return this.ensure(destinatario).getValue();
  }

  add(destinatario: string, parcial: Omit<Notificacao, 'id'|'destinatario'|'dataISO'|'lida'> & { dataISO?: string, lida?: boolean }) {
    const subj = this.ensure(destinatario);
    const list = subj.getValue();

    const novo: Notificacao = {
      id: (list[0]?.id ?? 0) + 1,
      destinatario,
      tipo: parcial.tipo ?? 'Notificação',
      mensagem: parcial.mensagem ?? '',
      dataISO: parcial.dataISO ?? new Date().toISOString(),
      lida: parcial.lida ?? false,
    };

    const updated = [novo, ...list];
    this.save(destinatario, updated);
    subj.next(updated);
  }

  markAllRead(destinatario: string): number {
    const subj = this.ensure(destinatario);
    const list = subj.getValue();
    let changed = 0;
    const updated = list.map(n => {
      if (!n.lida) { changed++; return { ...n, lida: true }; }
      return n;
    });
    if (changed > 0) {
      this.save(destinatario, updated);
      subj.next(updated);
    }
    return changed;
  }

  paginate(destinatario: string, page = 1, size = 10) {
    const list = this.snapshot(destinatario);
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / size));
    const start = (page - 1) * size;
    const end = start + size;
    const items = list.slice(start, end);
    return { items, page, size, total, totalPages };
  }

  clear(destinatario: string) {
    localStorage.removeItem(this.storageKey(destinatario));
    this.ensure(destinatario).next([]);
  }
}
