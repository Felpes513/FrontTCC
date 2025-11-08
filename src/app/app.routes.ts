import { ProjetoCadastro } from './shared/interfaces/projeto';
import { Routes } from '@angular/router';
import { orientadorGuard } from '@core/guards/orientador.guard';
import { alunoGuard } from '@core/guards/aluno.guard';
import { LandingRedirectGuard } from '@core/guards/landing-redirect.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [LandingRedirectGuard],
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

  {
    path: 'secretaria',
    loadComponent: () =>
      import('./shared/sidenav/sidenav-secretaria.component').then(
        (m) => m.SidenavSecretariaComponent
      ),
    children: [
      // ...
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
        path: 'projetos/:id/bolsas', // 👈 NOVA ROTA
        loadComponent: () =>
          import(
            './features/secretaria/atribuir-bolsas/atribuir-bolsas.component'
          ).then((m) => m.AtribuirBolsasComponent),
      },
      // ...
    ],
  },

  // ORIENTADOR
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
        loadComponent: () =>
          import(
            './features/secretaria/listagem-projetos/listagem-projetos.component'
          ).then((m) => m.ListagemProjetosComponent),
        data: { modo: 'ORIENTADOR' },
      },
      {
        path: 'projetos/:id',
        loadComponent: () =>
          import(
            './features/secretaria/formulario-projeto/formulario-projeto.component'
          ).then((m) => m.FormularioProjetoComponent),
        data: { modo: 'ORIENTADOR' },
      },
      { path: 'relatorios', redirectTo: 'projetos', pathMatch: 'full' },
      {
        path: 'relatorios/:projetoId',
        loadComponent: () =>
          import(
            './features/orientador/relatorio-form/relatorio-form.component'
          ).then((m) => m.RelatorioFormComponent),
      },
      { path: '', redirectTo: 'projetos', pathMatch: 'full' },
    ],
  },

  // ALUNO
  {
    path: 'aluno',
    canActivate: [alunoGuard],
    loadComponent: () =>
      import('./shared/sidenav/sidenav-secretaria.component').then(
        (m) => m.SidenavSecretariaComponent
      ),
    children: [
      { path: '', redirectTo: 'projetos', pathMatch: 'full' },
      {
        path: 'projetos',
        loadComponent: () =>
          import(
            './features/secretaria/listagem-projetos/listagem-projetos.component'
          ).then((m) => m.ListagemProjetosComponent),
      },
      {
        path: 'relatorios/:projetoId',
        loadComponent: () =>
          import(
            './features/orientador/relatorio-form/relatorio-form.component'
          ).then((m) => m.RelatorioFormComponent),
      },
    ],
  },
  {
    path: 'avaliador-externo/avaliacao/:token',
    loadComponent: () =>
      import(
        './features/avaliador-externo/formulario-avaliacao/formulario-avaliacao.component'
      ).then((m) => m.FormularioAvaliacaoExternaComponent),
  },
  {
    path: 'aluno/reset-password',
    loadComponent: () =>
      import('./shared/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
    data: { perfil: 'aluno' },
  },
  {
    path: 'orientador/reset-password',
    loadComponent: () =>
      import('./shared/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
    data: { perfil: 'orientador' },
  },
  {
    path: 'secretaria/reset-password',
    loadComponent: () =>
      import('./shared/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
    data: { perfil: 'secretaria' },
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./shared/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },

  // Fallback
  { path: '**', redirectTo: '' },
];
