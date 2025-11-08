// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NgIf } from '@angular/common'; // 👈
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, FooterComponent], // 👈
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(public router: Router) {}

  get showFooter() {
    const url = this.router.url;
    return url === '/' || url.startsWith('/home');
  }
}
