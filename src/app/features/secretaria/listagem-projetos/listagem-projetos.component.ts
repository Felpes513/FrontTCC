import { InscricoesService } from '@services/inscricoes.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Projeto } from '@interfaces/projeto';
import { ProjetoService } from '@services/projeto.service';
import { AuthService } from '@services/auth.service';
import { forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-listagem-projetos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatSnackBarModule],
  templateUrl: './listagem-projetos.component.html',
  styleUrls: ['./listagem-projetos.component.css'],
})
export class ListagemProjetosComponent implements OnInit {
  readonly MAX_ESCOLHIDOS = 4;

  projetos: (Projeto & { alunosIds?: number[] })[] = [];
  filtro = '';
  carregando = false;
  erro: string | null = null;
  filtroStatus = '';
  inscrevendoId: number | null = null;

  // papeis
  isOrientador = false;
  isSecretaria = false;
  isAluno = false;

  // ids de projetos em que ESTE aluno já clicou em "inscrever" (sessão atual)
  private inscricoesDoAluno = new Set<number>();

  constructor(
    private projetoService: ProjetoService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private inscricoesService: InscricoesService
  ) {}

  ngOnInit(): void {
    this.isOrientador = this.authService.hasRole('ORIENTADOR');
    this.isSecretaria = this.authService.hasRole('SECRETARIA');
    this.isAluno = this.authService.hasRole('ALUNO');
    this.carregarProjetos();
  }

  trackByFn(index: number, item: Projeto): any {
    return (item as any)?.id ?? index;
  }

  carregarProjetos(): void {
    this.carregando = true;
    this.erro = null;

    if (this.isOrientador) {
      this.projetoService.listarProjetosDoOrientador().subscribe({
        next: (projetos) => {
          this.projetos = (projetos ?? []) as any[];
          this.carregando = false;
          this.hidratarSelecionados(); // alunos aprovados (com ids)
          this.hidratarNotas();
        },
        error: (error) => this.handleLoadError(error),
      });
      return;
    }

    // Secretaria e Aluno
    this.projetoService.listarProjetos().subscribe({
      next: (projetos) => {
        const invalidos = projetos.filter(
          (p) => !(p as any).id || (p as any).id <= 0
        );
        if (invalidos.length)
          console.warn('⚠️ Projetos com ID inválido:', invalidos);

        this.projetos = (projetos as any[]) ?? [];
        this.carregando = false;

        this.hidratarSelecionados(); // alunos aprovados (com ids)
        this.hidratarNotas();
      },
      error: (error) => this.handleLoadError(error),
    });
  }

  /** Preenche nomesAlunos e também alunosIds (IDs aprovados pela Secretaria) */
  private hidratarSelecionados() {
    const calls = this.projetos
      .filter((p) => this.isIdValido((p as any).id))
      .map((p) =>
        this.inscricoesService.listarAprovadosDoProjeto((p as any).id).pipe(
          tap((alunos: any[]) => {
            const nomes = (alunos || []).map(
              (a) =>
                a?.nome_completo ||
                a?.nome ||
                a?.aluno?.nome ||
                `Aluno #${a?.id_aluno || a?.id || ''}`
            );
            const ids = (alunos || [])
              .map((a) => Number(a?.id_aluno ?? a?.id ?? a?.aluno?.id ?? 0))
              .filter((n) => !!n);

            (p as any).nomesAlunos = nomes;
            (p as any).alunosIds = ids;
            (p as any).inscritosTotal = nomes.length;
          }),
          catchError(() => of(null))
        )
      );

    if (calls.length) forkJoin(calls).subscribe();
  }

  private hidratarNotas() {
    const calls = this.projetos
      .filter((p) => this.isIdValido((p as any).id))
      .map((p) =>
        this.projetoService.listarNotasDoProjeto((p as any).id).pipe(
          tap((notas: number[]) => {
            (p as any).notas = notas || [];
            if ((p as any).notas.length) {
              const soma = (p as any).notas.reduce(
                (acc: number, n: number) => acc + (Number(n) || 0),
                0
              );
              (p as any).mediaNota = Number(
                (soma / (p as any).notas.length).toFixed(2)
              );
            } else {
              (p as any).mediaNota = undefined;
            }
          }),
          catchError(() => of(null))
        )
      );

    if (calls.length) forkJoin(calls).subscribe();
  }

  private handleLoadError(error: any) {
    console.error('❌ Erro ao carregar projetos:', error);
    if (error.status === 0) {
      this.erro = 'Erro de conexão: verifique se a API FastAPI está rodando.';
    } else if (error.status === 404) {
      this.erro =
        'Endpoint não encontrado: verifique se a rota /projetos está correta.';
    } else if (error.status >= 500) {
      this.erro = 'Erro interno do servidor: verifique os logs da API FastAPI.';
    } else {
      this.erro = error.message || 'Erro desconhecido ao carregar projetos';
    }
    this.carregando = false;
  }

  projetosFiltrados(): Projeto[] {
    const filtroLower = this.filtro.toLowerCase().trim();

    return this.projetos.filter((projeto: any) => {
      const combinaTexto =
        (projeto.nomeProjeto || '').toLowerCase().includes(filtroLower) ||
        (projeto.nomeOrientador || '').toLowerCase().includes(filtroLower) ||
        (projeto.campus || '').toLowerCase().includes(filtroLower);

      const combinaStatus =
        !this.isSecretaria ||
        !this.filtroStatus ||
        (projeto as any).status === this.filtroStatus;

      return combinaTexto && combinaStatus;
    }) as any;
  }

  // ===== Helpers =====

  getQuantidadeAlunos(p: Projeto & { alunosIds?: number[] }): number {
    return (p as any).inscritosTotal ?? (p as any).nomesAlunos?.length ?? 0;
  }

  temAlunos(projeto: Projeto): boolean {
    return ((projeto as any).nomesAlunos?.length ?? 0) > 0;
  }

  getOrientadorNome(projeto: Projeto): string {
    const nome = ((projeto as any)?.nomeOrientador ?? '').trim();
    return nome ? nome : 'Orientador não informado';
  }

  temOrientador(projeto: Projeto): boolean {
    return this.getOrientadorNome(projeto) !== 'Orientador não informado';
  }

  isLotado(projeto: Projeto): boolean {
    return (
      (this.getQuantidadeAlunos(projeto as any) ?? 0) >= this.MAX_ESCOLHIDOS
    );
  }

  getStatusProjeto(projeto: Projeto): string {
    if (!this.temIdValido(projeto)) return 'erro';
    const escolhidos = this.getQuantidadeAlunos(projeto as any);
    if (escolhidos >= this.MAX_ESCOLHIDOS) return 'lotado';
    if (escolhidos > 0) return 'em-andamento';
    return 'disponivel';
  }

  getCor(index: number): string {
    const cores = ['#007bff', '#28a745', '#ffc107'];
    return cores[index % cores.length];
  }

  // ===== Ações Secretaria =====
  excluirProjeto(projeto: Projeto | number): void {
    if (!this.isSecretaria) {
      this.snackBar.open('Ação não permitida.', 'Fechar', { duration: 3000 });
      return;
    }
    let id: number;
    let projetoObj: any | null = null;

    if (typeof projeto === 'number') {
      id = projeto;
      projetoObj = this.projetos.find((p: any) => p.id === id) || null;
    } else {
      id = (projeto as any).id;
      projetoObj = projeto as any;
    }

    if (!this.isIdValido(id)) {
      alert('ID inválido.');
      return;
    }
    if (!projetoObj) {
      alert('Projeto não encontrado.');
      return;
    }

    const nomeExibicao = projetoObj.nomeProjeto || 'Desconhecido';
    const confirmacao = confirm(
      `Excluir o projeto "${nomeExibicao}"?\n\nID: ${id}`
    );
    if (!confirmacao) return;

    this.projetoService.excluirProjeto(id).subscribe({
      next: (response) => {
        const mensagem =
          (response as any)?.mensagem ||
          (response as any)?.message ||
          'Projeto excluído com sucesso';
        this.snackBar.open(mensagem, 'Fechar', { duration: 3000 });
        this.carregarProjetos();
      },
      error: (error) => {
        let mensagemErro = '';
        if (error.status === 0) mensagemErro = 'Erro de conexão';
        else if (error.status === 404) mensagemErro = 'Projeto não encontrado';
        else if (error.status === 422) mensagemErro = 'ID inválido';
        else if (error.status >= 500) mensagemErro = 'Erro interno';
        else mensagemErro = error.message || `Erro HTTP ${error.status}`;
        this.snackBar.open(`Erro ao excluir: ${mensagemErro}`, 'Fechar', {
          duration: 4000,
        });
      },
    });
  }

  editarProjeto(id: number): void {
    if (!this.isSecretaria) {
      this.snackBar.open('Ação não permitida.', 'Fechar', { duration: 3000 });
      return;
    }
    if (!this.isIdValido(id)) {
      alert('ID inválido');
      return;
    }
    this.router.navigate(['/secretaria/projetos/editar', id]);
  }

  // ===== Ações Orientador =====
  irParaRelatorio(projeto: Projeto): void {
    const id = (projeto as any)?.id;
    if (!this.isIdValido(id)) {
      alert('Projeto sem ID válido.');
      return;
    }
    this.router.navigate(['/orientador/relatorios', id]);
  }

  // ===== Ações Aluno =====
  inscrever(projeto: Projeto & { alunosIds?: number[] }) {
    const id = (projeto as any)?.id;

    if (!this.isAluno) {
      this.snackBar.open(
        'Somente alunos podem se inscrever em projetos.',
        'Fechar',
        { duration: 3000 }
      );
      return;
    }
    if (!this.isIdValido(id)) {
      this.snackBar.open('Projeto sem ID válido.', 'Fechar', {
        duration: 3000,
      });
      return;
    }
    if (this.isLotado(projeto)) {
      this.snackBar.open('Seleção finalizada para este projeto.', 'Fechar', {
        duration: 3000,
      });
      return;
    }
    if (this.jaInscrito(id)) {
      this.snackBar.open('Você já se inscreveu neste projeto.', 'Fechar', {
        duration: 2500,
      });
      return;
    }

    if (
      !confirm(
        `Confirmar inscrição no projeto "${(projeto as any).nomeProjeto}"?`
      )
    )
      return;

    this.inscrevendoId = id;
    this.inscricoesService.inscrever(id).subscribe({
      next: (res) => {
        this.inscrevendoId = null;
        this.marcarInscritoLocal(id);
        this.snackBar.open(
          res?.message || 'Inscrição realizada com sucesso!',
          'Fechar',
          { duration: 3000 }
        );
      },
      error: (e) => {
        this.inscrevendoId = null;
        const msg = e?.error?.detail || e?.message || 'Erro ao inscrever.';
        this.snackBar.open(msg, 'Fechar', { duration: 4000 });
      },
    });
  }

  irParaRelatorioAluno(projeto: Projeto & { alunosIds?: number[] }) {
    const id = (projeto as any)?.id;
    if (!this.isIdValido(id)) {
      alert('Projeto sem ID válido.');
      return;
    }
    this.router.navigate(['/aluno/relatorios', id]);
  }

  // ===== Regras de exibição (Aluno) =====

  /** true se o aluno (sessão) já clicou para se inscrever neste projeto */
  jaInscrito(idProjeto: number): boolean {
    return this.inscricoesDoAluno.has(idProjeto);
  }
  private marcarInscritoLocal(idProjeto: number) {
    this.inscricoesDoAluno.add(idProjeto);
  }

  /** Exibe “Meu Relatório” somente se ESTE aluno consta entre os aprovados do projeto */
  podeVerRelatorio(projeto: Projeto & { alunosIds?: number[] }): boolean {
    if (!this.isAluno) return false;
    const meuId = this.getMeuId();
    if (!meuId) return false;
    const ids = (projeto as any).alunosIds as number[] | undefined;
    return Array.isArray(ids) && ids.includes(Number(meuId));
  }

  // util
  recarregar(): void {
    this.carregarProjetos();
  }
  temIdValido(projeto: Projeto): boolean {
    return this.isIdValido((projeto as any).id);
  }
  private isIdValido(id: any): id is number {
    return (
      id !== undefined &&
      id !== null &&
      typeof id === 'number' &&
      !isNaN(id) &&
      id > 0
    );
  }

  calcularProgresso(projeto: Projeto): number {
    const escolhidos = this.getQuantidadeAlunos(projeto as any);
    const progresso = (escolhidos / this.MAX_ESCOLHIDOS) * 100;
    return Math.max(0, Math.min(progresso, 100));
  }

  // tenta obter o ID do usuário logado do AuthService
  private getMeuId(): number | null {
    try {
      // ajuste aqui conforme seu AuthService
      if (typeof (this.authService as any).getUserId === 'function') {
        return Number((this.authService as any).getUserId());
      }
      if ((this.authService as any).userId != null) {
        return Number((this.authService as any).userId);
      }
    } catch {}
    return null;
  }

  // ==== DEBUG =====
  debugProjeto(projeto: Projeto): void {
    console.log('🔍 Debug do projeto:', {
      id: (projeto as any).id,
      nome: (projeto as any).nomeProjeto,
      escolhidos: this.getQuantidadeAlunos(projeto as any),
      alunosIds: (projeto as any).alunosIds,
      podeVerRelatorio: this.podeVerRelatorio(projeto as any),
    });
  }
  debugListaProjetos(): void {
    console.log('🔍 Debug da lista completa:', {
      totalProjetos: this.projetos.length,
      projetos: this.projetos.map((p: any) => ({
        id: p.id,
        nome: p.nomeProjeto,
        escolhidos: this.getQuantidadeAlunos(p),
        alunosIds: p.alunosIds,
      })),
    });
  }
}
