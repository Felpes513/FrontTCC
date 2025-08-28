import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./shared/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'cadastro',
    loadComponent: () =>
      import('./shared/cadastro/cadastro.component').then(m => m.RegisterComponent),
  },
  {
    path: 'secretaria',
    loadComponent: () =>
      import('./shared/sidenav/sidenav-secretaria.component')
        .then(m => m.SidenavSecretariaComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./secretaria/dashboard/dashboard.component')
            .then(m => m.DashboardComponent),
      },
      {
        path: 'avaliadores',
        loadComponent: () =>
          import('./secretaria/listagem-avaliadores/listagem-avaliadores.component')
            .then(m => m.ListagemAvaliadoresComponent),
      },
      {
        path: 'avaliadores/novo',
        loadComponent: () =>
          import('./secretaria/formulario-avaliador/formulario-avaliador.component')
            .then(m => m.FormularioAvaliadorComponent),
      },
      {
        path: 'notificacoes',
        loadComponent: () =>
          import('./secretaria/notificacoes/notificacoes.component')
            .then(m => m.NotificacoesComponent),
      },
      {
        path: 'projetos',
        loadComponent: () =>
          import('./secretaria/listagem-projetos/listagem-projetos.component')
            .then(m => m.ListagemProjetosComponent),
      },
      {
        path: 'projetos/novo',
        loadComponent: () =>
          import('./secretaria/formulario-projeto/formulario-projeto.component')
            .then(m => m.FormularioProjetoComponent),
      },
      {
        path: 'projetos/editar/:id',
        loadComponent: () =>
          import('./secretaria/formulario-projeto/formulario-projeto.component')
            .then(m => m.FormularioProjetoComponent),
      },
      {
        path: 'email',
        loadComponent: () =>
          import('./secretaria/envio-de-email/envio-de-email.component')
            .then(m => m.EnvioDeEmailComponent),   // <- só se você corrigir o arquivo (Opção A)
      },
      {
        path: 'relatorios',
        loadComponent: () =>
          import('./secretaria/relatorios/relatorios.component')
            .then(m => m.RelatoriosComponent),
      },
    ],
  },
  {
    path: 'orientador/projetos',
    loadComponent: () =>
      import('./orientador/listagem-projetos/listagem-projetos.component')
        .then(m => m.ListagemProjetosComponent),
  },
  { path: '**', redirectTo: '' },
];
