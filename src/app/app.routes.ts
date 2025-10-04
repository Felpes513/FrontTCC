import { Routes } from '@angular/router';
import { orientadorGuard } from '@core/guards/orientador.guard';
import { ConfiguracoesComponent } from './features/secretaria/configuracoes/configuracoes.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('@shared/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'cadastro',
    loadComponent: () =>
      import('@shared/cadastro/cadastro.component').then(
        (m) => m.RegisterComponent
      ),
  },

  // ===== SECRETARIA (usa o mesmo sidenav) =====
  {
    path: 'secretaria',
    loadComponent: () =>
      import('./shared/sidenav/sidenav-secretaria.component').then(
        (m) => m.SidenavSecretariaComponent
      ),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/secretaria/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'avaliadores',
        loadComponent: () =>
          import(
            './features/secretaria/listagem-avaliadores/listagem-avaliadores.component'
          ).then((m) => m.ListagemAvaliadoresComponent),
      },
      {
        path: 'avaliadores/novo',
        loadComponent: () =>
          import(
            './features/secretaria/formulario-avaliador/formulario-avaliador.component'
          ).then((m) => m.FormularioAvaliadorComponent),
      },
      {
        path: 'notificacoes',
        loadComponent: () =>
          import('./features/secretaria/notificacoes/notificacoes.component').then(
            (m) => m.NotificacoesComponent
          ),
      },
      {
        path: 'projetos',
        loadComponent: () =>
          import(
            './features/secretaria/listagem-projetos/listagem-projetos.component'
          ).then((m) => m.ListagemProjetosComponent),
      },
      {
        path: 'projetos/novo',
        loadComponent: () =>
          import(
            './features/secretaria/formulario-projeto/formulario-projeto.component'
          ).then((m) => m.FormularioProjetoComponent),
      },
      {
        path: 'projetos/editar/:id',
        loadComponent: () =>
          import(
            './features/secretaria/formulario-projeto/formulario-projeto.component'
          ).then((m) => m.FormularioProjetoComponent),
      },
      {
        path: 'email',
        loadComponent: () =>
          import('./features/secretaria/envio-de-email/envio-de-email.component').then(
            (m) => m.EnvioDeEmailComponent
          ),
      },
      {
        path: 'relatorios',
        loadComponent: () =>
          import('./features/secretaria/relatorios/relatorios.component').then(
            (m) => m.RelatoriosComponent
          ),
      },
    ],
  },

  // ===== ORIENTADOR (mesmo sidenav + guard) =====
  {
    path: 'orientador',
    canActivate: [orientadorGuard],
    loadComponent: () =>
      import('./shared/sidenav/sidenav-secretaria.component').then(
        (m) => m.SidenavSecretariaComponent
      ),
    children: [
      {
        path: 'projetos',
        // usa a MESMA listagem da secretaria
        loadComponent: () =>
          import(
            './features/secretaria/listagem-projetos/listagem-projetos.component'
          ).then((m) => m.ListagemProjetosComponent),
        data: { modo: 'ORIENTADOR' }, // opcional (fallback ao AuthService)
      },
      {
        path: 'relatorios',
        redirectTo: 'projetos',
        pathMatch: 'full',
      },
      {
        path: 'relatorios/:projetoId',
        loadComponent: () =>
          import('./features/orientador/relatorio-form/relatorio-form.component').then(
            (m) => m.RelatorioFormComponent
          ),
      },
      { path: '', redirectTo: 'projetos', pathMatch: 'full' },
    ],
  },

  // Fallback
  { path: '**', redirectTo: '' },
];
