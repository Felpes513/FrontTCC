import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { ListagemProjetosComponent } from './secretaria/listagem-projetos/listagem-projetos.component';
import { FormularioProjetoComponent } from './secretaria/formulario-projeto/formulario-projeto.component';
import { EnvioDeEmailComponent } from './secretaria/envio-de-email/envio-de-email.component';
import { LoginComponent } from './login/login.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  {path: 'login', component: LoginComponent},
  {
    path: 'secretaria',
    component: SidenavComponent,
    children: [
      { path: 'projetos', component: ListagemProjetosComponent },
      { path: 'projetos/novo', component: FormularioProjetoComponent },
      { path: 'projetos/editar/:id', component: FormularioProjetoComponent },
      { path: 'email', component: EnvioDeEmailComponent }
    ]
  }
];
