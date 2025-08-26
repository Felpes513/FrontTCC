import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './secretaria/dashboard/dashboard.component';
import { ListagemProjetosComponent } from './secretaria/listagem-projetos/listagem-projetos.component';
import { FormularioProjetoComponent } from './secretaria/formulario-projeto/formulario-projeto.component';
import { EnvioDeEmailComponent } from './secretaria/envio-de-email/envio-de-email.component';
import { LoginComponent } from './shared/login/login.component';
import { RegisterComponent } from './shared/cadastro/cadastro.component';
import { RelatoriosComponent } from './secretaria/relatorios/relatorios.component';
import { NotificacoesComponent } from './secretaria/notificacoes/notificacoes.component';
import { ListagemAvaliadoresComponent } from './secretaria/listagem-avaliadores/listagem-avaliadores.component';
import { FormularioAvaliadorComponent } from './secretaria/formulario-avaliador/formulario-avaliador.component';
import { SidenavSecretariaComponent } from './shared/sidenav/sidenav-secretaria.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: RegisterComponent },

  {
    path: 'secretaria',
    component: SidenavSecretariaComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'avaliadores', component: ListagemAvaliadoresComponent },
      { path: 'avaliadores/novo', component: FormularioAvaliadorComponent },
      { path: 'notificacoes', component: NotificacoesComponent },
      { path: 'projetos', component: ListagemProjetosComponent },
      { path: 'projetos/novo', component: FormularioProjetoComponent },
      { path: 'projetos/editar/:id', component: FormularioProjetoComponent },
      { path: 'email', component: EnvioDeEmailComponent },
      { path: 'relatorios', component: RelatoriosComponent },
    ],
  },

  {
    path: 'orientador/projetos',
    loadComponent: () =>
      import('./orientador/listagem-projetos/listagem-projetos.component').then(
        (m) => m.ListagemProjetosComponent
      ),
  },
];
