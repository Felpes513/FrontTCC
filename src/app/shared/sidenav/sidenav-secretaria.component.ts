import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription, interval, of } from 'rxjs';
import { catchError, startWith, switchMap } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, Role } from '@services/auth.service';
import { ProjetoService } from '@services/projeto.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
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

  // Mobile/menu state
  isMobile = false;
  isMenuOpen = true;

  papelLegivel = computed(() => {
    const map: Record<Role, string> = {
      SECRETARIA: 'Secretaria',
      ORIENTADOR: 'Orientador',
      ALUNO: 'Aluno',
    };
    return this.role ? map[this.role] : 'Usuário';
  });

  ngOnInit(): void {
    this.updateLayout(); // define isMobile e isMenuOpen

    if (this.isSecretaria) {
      this.notifSub = interval(30000)
        .pipe(
          startWith(0),
          switchMap(() =>
            this.projetoService
              .getNotificacoesPaginado('secretaria', 1, 10)
              .pipe(
                catchError(() =>
                  this.projetoService.getNotificacoes('secretaria')
                ),
                catchError(() => of([]))
              )
          )
        )
        .subscribe((res: any) => {
          const items = Array.isArray(res) ? res : res?.items ?? [];
          this.exibirBadgeNotificacao =
            items.some((n: any) => n?.lida === false) ||
            (items.length > 0 && !items.every((n: any) => n?.lida === true));
        });
    }
  }

  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateLayout();
  }

  private updateLayout(): void {
    this.isMobile = window.matchMedia('(max-width: 768px)').matches;
    // no desktop, mantém sempre aberto; no mobile, inicia fechado
    this.isMenuOpen = this.isMobile ? false : true;
  }

  toggleMenu(): void {
    if (this.isMobile) this.isMenuOpen = !this.isMenuOpen;
  }

  onNavClick(): void {
    // ao navegar no mobile, fecha o menu para liberar a tela
    if (this.isMobile) this.isMenuOpen = false;
  }

  confirmarSaida(e: Event) {
    e.preventDefault();
    if (!window.confirm('Tem certeza que deseja sair?')) return;
    this.auth.clearSession();
    this.router.navigate(['/'], { replaceUrl: true });
  }

  marcarNotificacoesComoLidas() {
    this.exibirBadgeNotificacao = false;
    if (this.isSecretaria) {
      this.projetoService.marcarTodasComoLidas('secretaria').subscribe({
        error: () => {},
      });
    }
  }
}
