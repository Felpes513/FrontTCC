import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Projeto } from '@interfaces/projeto';
import { ProjetoService } from '@services/projeto.service';
import { AuthService } from '@services/auth.service';
import { InscricaoAlunoService } from '@services/inscricoes-aluno.service';
@Component({
  selector: 'app-listagem-projetos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatSnackBarModule],
  templateUrl: './listagem-projetos.component.html',
  styleUrls: ['./listagem-projetos.component.css'],
})
export class ListagemProjetosComponent implements OnInit {
  projetos: Projeto[] = [];
  filtro: string = '';
  carregando: boolean = false;
  erro: string | null = null;
  filtroStatus: string = '';

  // papeis
  isOrientador = false;
  isSecretaria = false;
  isAluno = false;

  constructor(
    private projetoService: ProjetoService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private inscricaoService: InscricaoAlunoService
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
        },
        error: (error) => this.handleLoadError(error),
      });
      return;
    }

    // Secretaria e Aluno usam a listagem geral
    this.projetoService.listarProjetos().subscribe({
      next: (projetos) => {
        const invalidos = projetos.filter((p) => !p.id || p.id <= 0);
        if (invalidos.length)
          console.warn('⚠️ Projetos com ID inválido:', invalidos);
        this.projetos = projetos;
        this.carregando = false;
      },
      error: (error) => this.handleLoadError(error),
    });
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

  // auxiliares template
  getOrientadorNome(projeto: Projeto): string {
    return projeto.nomeOrientador;
  }
  getQuantidadeAlunos(projeto: Projeto): number {
    return projeto.quantidadeMaximaAlunos || 0;
  }
  temAlunos(projeto: Projeto): boolean {
    return (projeto.quantidadeMaximaAlunos || 0) > 0;
  }
  temOrientador(projeto: Projeto): boolean {
    return projeto.nomeOrientador !== 'Orientador não informado';
  }
  simularProgresso(index: number): number {
    return 30 + (index % 3) * 20;
  }
  getCor(index: number): string {
    const cores = ['#007bff', '#28a745', '#ffc107'];
    return cores[index % cores.length];
  }

  // Secretaria
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

  // Orientador
  irParaRelatorio(projeto: Projeto): void {
    const id = projeto?.id;
    if (!this.isIdValido(id)) {
      alert('Projeto sem ID válido.');
      return;
    }
    this.router.navigate(['/orientador/relatorios', id]);
  }

  // Aluno
  inscrever(projeto: Projeto) {
    if (!this.isAluno) return;
    const id = projeto?.id;
    if (!this.isIdValido(id)) {
      alert('Projeto sem ID válido.');
      return;
    }
    if (!confirm(`Confirmar inscrição no projeto "${projeto.nomeProjeto}"?`))
      return;

    this.inscricaoService.inscrever(id).subscribe({
      next: (res) => {
        alert(res?.message || 'Inscrição realizada com sucesso!');
        // opcional: ir direto para relatório do aluno
        this.router.navigate(['/aluno/relatorios', id]);
      },
      error: (e) => {
        const msg = e?.error?.detail || e?.message || 'Erro ao inscrever.';
        alert(msg);
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

  getStatusProjeto(projeto: Projeto): string {
    if (!this.temIdValido(projeto)) return 'erro';
    if (projeto.nomesAlunos.length >= (projeto.quantidadeMaximaAlunos || 0))
      return 'lotado';
    if (projeto.nomesAlunos.length > 0) return 'em-andamento';
    return 'disponivel';
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
        return 'Disponível';
      case 'em-andamento':
        return 'Em andamento';
      case 'lotado':
        return 'Lotado';
      case 'erro':
        return 'Erro';
      default:
        return 'Desconhecido';
    }
  }

  calcularProgresso(projeto: Projeto): number {
    const max = projeto.quantidadeMaximaAlunos || 0;
    if (max === 0) return 0;
    const progresso = (projeto.nomesAlunos.length / max) * 100;
    return Math.min(progresso, 100);
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
      maxAlunos: projeto.quantidadeMaximaAlunos,
      alunos: projeto.nomesAlunos,
      qtdAlunosAtual: projeto.nomesAlunos.length,
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
      'Máximo de Alunos': p.quantidadeMaximaAlunos,
      'Alunos Inscritos': p.nomesAlunos.length,
      Status: this.getTextoStatus(this.getStatusProjeto(p)),
      'Progresso (%)': this.calcularProgresso(p).toFixed(1),
    }));
    console.log('📊 Dados para exportação:', dadosExportacao);
  }
}
