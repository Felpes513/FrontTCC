import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { ListagemProjetosComponent } from './secretaria/listagem-projetos/listagem-projetos.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'secretaria',
    component: SidenavComponent,
    children: [
      { path: 'projetos', component: ListagemProjetosComponent }
    ]
  }
];