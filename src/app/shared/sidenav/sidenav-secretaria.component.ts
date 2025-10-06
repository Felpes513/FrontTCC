import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription, interval, of } from 'rxjs';
import { catchError, startWith, switchMap } from 'rxjs/operators';
import { AuthService, Role } from '@services/auth.service';
import { ProjetoService } from '@services/projeto.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidenav-secretaria.component.html',
  styleUrls: ['./sidenav-secretaria.component.css'],
})
export class SidenavSecretariaComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private auth = inject(AuthService);
  private projetoService = inject(ProjetoService);

  exibirBadgeNotificacao = false;
  private notifSub?: Subscription;

  role = this.auth.getRole();
  isSecretaria = this.auth.hasRole('SECRETARIA');
  isOrientador = this.auth.hasRole('ORIENTADOR');
  isAluno = this.auth.hasRole('ALUNO');

  papelLegivel = computed(() => {
    const map: Record<Role, string> = {
      SECRETARIA: 'Secretaria',
      ORIENTADOR: 'Orientador',
      ALUNO: 'Aluno',
    };
    return this.role ? map[this.role] : 'Usuário';
  });

  ngOnInit(): void {
    // Badge de notificações: só para Secretaria
    if (this.isSecretaria) {
      this.notifSub = interval(30000).pipe(
        startWith(0),
        switchMap(() =>
          // tenta paginado; se falhar, cai no simples
          this.projetoService.getNotificacoesPaginado('secretaria', 1, 10).pipe(
            catchError(() => this.projetoService.getNotificacoes('secretaria')),
            catchError(() => of([])) // último fallback
          )
        )
      ).subscribe((res: any) => {
        const items = Array.isArray(res) ? res : (res?.items ?? []);
        // se a API tiver campo "lida" usamos, senão badge quando houver qualquer item
        this.exibirBadgeNotificacao =
          items.some((n: any) => n?.lida === false) || (items.length > 0 && !items.every((n: any) => n?.lida === true));
      });
    }
  }

  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
  }

  confirmarSaida(e: Event) {
    e.preventDefault();
    if (!window.confirm('Tem certeza que deseja sair?')) return;
    this.auth.clearSession();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  marcarNotificacoesComoLidas() {
    this.exibirBadgeNotificacao = false;
    if (this.isSecretaria) {
      this.projetoService.marcarTodasComoLidas('secretaria').subscribe({
        error: () => {
        }
      });
    }
  }
}
