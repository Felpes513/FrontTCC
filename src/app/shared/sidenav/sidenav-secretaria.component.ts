import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidenav-secretaria',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidenav-secretaria.component.html',
  styleUrls: ['./sidenav-secretaria.component.css']
})
export class SidenavSecretariaComponent {
  exibirBadgeNotificacao = false;

  constructor(private router: Router) {}

  confirmarSaida(event: Event): void {
    event.preventDefault(); // impede a navegação padrão do <a>
    const ok = window.confirm('Tem certeza que deseja sair?');
    if (!ok) return;
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  marcarNotificacoesComoLidas(): void {
    this.exibirBadgeNotificacao = false;
  }
}
