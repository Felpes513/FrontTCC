import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// importe seus componentes de layout (ajuste os paths conforme seu projeto)
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'], // se você tiver um css para o app
})
export class AppComponent {}
