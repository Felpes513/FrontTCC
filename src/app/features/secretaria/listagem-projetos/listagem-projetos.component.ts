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
  readonly MAX_ESCOLHIDOS = 4; // 👈 regra do orientador: escolhe até 4

  projetos: Projeto[] = [];
  filtro = '';
  carregando = false;
  erro: string | null = null;
  filtroStatus = '';
  inscrevendoId: number | null = null;

  // papeis
  isOrientador = false;
  isSecretaria = false;
  isAluno = false;

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
    return item?.id ?? index;
  }

  carregarProjetos(): void {
    this.carregando = true;
    this.erro = null;

    if (this.isOrientador) {
      this.projetoService.listarProjetosDoOrientador().subscribe({
        next: (projetos) => {
          this.projetos = projetos ?? [];
          this.carregando = false;
          // 👇 hidrata lista de selecionados para cada card
          this.hidratarSelecionados();
          // 👇 hidrata também as notas (ver seção 2)
          this.hidratarNotas();
        },
        error: (error) => this.handleLoadError(error),
      });
      return;
    }

    // Secretaria e Aluno
    this.projetoService.listarProjetos().subscribe({
      next: (projetos) => {
        const invalidos = projetos.filter((p) => !p.id || p.id <= 0);
        if (invalidos.length)
          console.warn('⚠️ Projetos com ID inválido:', invalidos);
        this.projetos = projetos;
        this.carregando = false;
        // 👇 hidrata lista de selecionados para cada card
        this.hidratarSelecionados();
        // 👇 hidrata também as notas (ver seção 2)
        this.hidratarNotas();
      },
      error: (error) => this.handleLoadError(error),
    });
  }

  private hidratarSelecionados() {
    const calls = this.projetos
      .filter((p) => this.isIdValido(p.id))
      .map((p) =>
        this.inscricoesService.listarAprovadosDoProjeto(p.id).pipe(
          tap((alunos: any[]) => {
            p.nomesAlunos = (alunos || []).map(
              (a) =>
                a?.nome_completo ||
                a?.nome ||
                a?.aluno?.nome ||
                `Aluno #${a?.id_aluno || a?.id || ''}`
            );
            // se o back já devolver quantidade total, pode guardar também:
            p.inscritosTotal = p.nomesAlunos.length;
          }),
          catchError(() => of(null))
        )
      );

    if (calls.length) {
      forkJoin(calls).subscribe();
    }
  }

  private hidratarNotas() {
    const calls = this.projetos
      .filter((p) => this.isIdValido(p.id))
      .map((p) =>
        this.projetoService.listarNotasDoProjeto(p.id).pipe(
          tap((notas: number[]) => {
            p.notas = notas || [];
            if (p.notas.length) {
              const soma = p.notas.reduce(
                (acc, n) => acc + (Number(n) || 0),
                0
              );
              p.mediaNota = Number((soma / p.notas.length).toFixed(2));
            } else {
              p.mediaNota = undefined;
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

    return this.projetos.filter((projeto) => {
      const combinaTexto =
        (projeto.nomeProjeto || '').toLowerCase().includes(filtroLower) ||
        (projeto.nomeOrientador || '').toLowerCase().includes(filtroLower) ||
        (projeto.campus || '').toLowerCase().includes(filtroLower);

      // filtro de status só para Secretaria
      const combinaStatus =
        !this.isSecretaria ||
        !this.filtroStatus ||
        (projeto as any).status === this.filtroStatus;

      return combinaTexto && combinaStatus;
    });
  }

  // ===== Helpers de UI com a nova regra =====

  getQuantidadeAlunos(p: Projeto): number {
    return p.inscritosTotal ?? p.nomesAlunos?.length ?? 0;
  }

  // Tem selecionados pelo orientador?
  temAlunos(projeto: Projeto): boolean {
    return (projeto.nomesAlunos?.length ?? 0) > 0;
  }

  getOrientadorNome(projeto: Projeto): string {
    const nome = (projeto?.nomeOrientador ?? '').trim();
    return nome ? nome : 'Orientador não informado';
  }

  temOrientador(projeto: Projeto): boolean {
    // mantém a lógica de “vazio” consistente com o método acima
    return this.getOrientadorNome(projeto) !== 'Orientador não informado';
  }

  // Lotado = orientador já escolheu o limite (4)
  isLotado(projeto: Projeto): boolean {
    return (projeto.nomesAlunos?.length ?? 0) >= this.MAX_ESCOLHIDOS;
  }

  getStatusProjeto(projeto: Projeto): string {
    if (!this.temIdValido(projeto)) return 'erro';
    const escolhidos = this.getQuantidadeAlunos(projeto);
    if (escolhidos >= this.MAX_ESCOLHIDOS) return 'lotado'; // seleção finalizada
    if (escolhidos > 0) return 'em-andamento'; // já tem escolhidos, mas não fechou
    return 'disponivel'; // ninguém escolhido ainda
  }

  getCorStatus(status: string): string {
    switch (status) {
      case 'disponivel':
        return '#28a745';
      case 'em-andamento':
        return '#ffc107';
      case 'lotado':
        return '#dc3545';
      case 'erro':
        return '#6c757d';
      default:
        return '#007bff';
    }
  }

  getTextoStatus(status: string): string {
    switch (status) {
      case 'disponivel':
        return 'Candidaturas abertas';
      case 'em-andamento':
        return 'Parcialmente selecionado';
      case 'lotado':
        return 'Seleção finalizada';
      case 'erro':
        return 'Erro';
      default:
        return 'Desconhecido';
    }
  }

  simularProgresso(index: number): number {
    return 30 + (index % 3) * 20; // apenas visual
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
    let projetoObj: Projeto | null = null;

    if (typeof projeto === 'number') {
      id = projeto;
      projetoObj = this.projetos.find((p) => p.id === id) || null;
    } else {
      id = projeto.id;
      projetoObj = projeto;
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
    const id = projeto?.id;
    if (!this.isIdValido(id)) {
      alert('Projeto sem ID válido.');
      return;
    }
    this.router.navigate(['/orientador/relatorios', id]);
  }

  // ===== Ações Aluno =====
  inscrever(projeto: Projeto) {
    const id = projeto?.id;

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

    if (!confirm(`Confirmar inscrição no projeto "${projeto.nomeProjeto}"?`))
      return;

    this.inscrevendoId = id;
    this.inscricoesService.inscrever(id).subscribe({
      next: (res) => {
        this.inscrevendoId = null;
        this.snackBar.open(
          res?.message || 'Inscrição realizada com sucesso!',
          'Fechar',
          { duration: 3000 }
        );
        // O aluno pode se inscrever em vários; não vamos redirecionar automaticamente.
        // Se quiser redirecionar para relatórios, descomente:
        // this.router.navigate(['/aluno/relatorios', id]);
      },
      error: (e) => {
        this.inscrevendoId = null;
        const msg = e?.error?.detail || e?.message || 'Erro ao inscrever.';
        this.snackBar.open(msg, 'Fechar', { duration: 4000 });
      },
    });
  }

  irParaRelatorioAluno(projeto: Projeto) {
    const id = projeto?.id;
    if (!this.isIdValido(id)) {
      alert('Projeto sem ID válido.');
      return;
    }
    this.router.navigate(['/aluno/relatorios', id]);
  }

  // util
  recarregar(): void {
    this.carregarProjetos();
  }
  temIdValido(projeto: Projeto): boolean {
    return this.isIdValido(projeto.id);
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
    const escolhidos = this.getQuantidadeAlunos(projeto);
    const cap = this.MAX_ESCOLHIDOS;
    const progresso = (escolhidos / this.MAX_ESCOLHIDOS) * 100;
    return Math.max(0, Math.min(progresso, 100));
  }

  // DEBUG (mantidos)
  debugProjeto(projeto: Projeto): void {
    console.log('🔍 Debug do projeto:', {
      id: projeto.id,
      tipoId: typeof projeto.id,
      idValido: this.temIdValido(projeto),
      nome: projeto.nomeProjeto,
      campus: projeto.campus,
      orientador: projeto.nomeOrientador,
      escolhidos: this.getQuantidadeAlunos(projeto),
      maxEscolhidos: this.MAX_ESCOLHIDOS,
      status: this.getStatusProjeto(projeto),
      progresso: this.calcularProgresso(projeto),
    });
  }

  debugListaProjetos(): void {
    console.log('🔍 Debug da lista completa:', {
      totalProjetos: this.projetos.length,
      projetosComIdValido: this.projetos.filter((p) => this.temIdValido(p))
        .length,
      projetos: this.projetos.map((p) => ({
        id: p.id,
        tipoId: typeof p.id,
        nome: p.nomeProjeto,
        temIdValido: this.temIdValido(p),
        status: this.getStatusProjeto(p),
        escolhidos: this.getQuantidadeAlunos(p),
      })),
    });
  }

  // Export placeholder
  exportarProjetos(): void {
    const dadosExportacao = this.projetos.map((p) => ({
      ID: p.id,
      'Nome do Projeto': p.nomeProjeto,
      Campus: p.campus,
      Orientador: p.nomeOrientador,
      Selecionados: this.getQuantidadeAlunos(p),
      'Limite Seleção': this.MAX_ESCOLHIDOS,
      Status: this.getTextoStatus(this.getStatusProjeto(p)),
      'Progresso (%)': this.calcularProgresso(p).toFixed(1),
    }));
    console.log('📊 Dados para exportação:', dadosExportacao);
  }
}
