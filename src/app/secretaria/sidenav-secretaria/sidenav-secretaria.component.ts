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
  exibirBadgeNotificacao = true;

  marcarNotificacoesComoLidas() {
    this.exibirBadgeNotificacao = false;
  }
}
