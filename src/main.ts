import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core'; // 👈 Import necessário
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // 👈 FontAwesome aqui

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(FontAwesomeModule) // 👈 Habilita <fa-icon>
  ]
});
