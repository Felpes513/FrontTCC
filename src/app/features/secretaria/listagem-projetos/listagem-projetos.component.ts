import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Projeto } from '@interfaces/projeto';
import { ProjetoService } from '@services/projeto.service';
import { AuthService } from '@services/auth.service';

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

  // 👉 papel atual
  isOrientador = false;

  constructor(
    private projetoService: ProjetoService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isOrientador = this.authService.hasRole('ORIENTADOR');
    this.carregarProjetos();
  }

  trackByFn(index: number, item: Projeto): any {
    return item?.id ?? index;
  }

  // ✅ Carregar projetos (decide pelo papel)
  carregarProjetos(): void {
    this.carregando = true;
    this.erro = null;

    if (this.isOrientador) {
      // lista só do orientador
      this.projetoService.listarProjetosDoOrientador().subscribe({
        next: (projetos) => {
          this.projetos = projetos ?? [];
          this.carregando = false;
          // debug enxuto
          console.log('[ORIENTADOR] projetos:', this.projetos);
        },
        error: (error) => this.handleLoadError(error),
      });
      return;
    }

    // secretaria (sua lógica atual)
    this.projetoService.listarProjetos().subscribe({
      next: (projetos) => {
        // avisos de id inválido (mantive da sua versão)
        const invalidos = projetos.filter((p) => !p.id || p.id <= 0);
        if (invalidos.length) {
          console.warn('⚠️ Projetos com ID inválido:', invalidos);
        }
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
      this.erro = 'Endpoint não encontrado: verifique se a rota /projetos está correta.';
    } else if (error.status >= 500) {
      this.erro = 'Erro interno do servidor: verifique os logs da API FastAPI.';
    } else {
      this.erro = error.message || 'Erro desconhecido ao carregar projetos';
    }
    this.carregando = false;
  }

  // ✅ Filtro de projetos
  projetosFiltrados(): Projeto[] {
    const filtroLower = this.filtro.toLowerCase().trim();

    return this.projetos.filter((projeto) => {
      const combinaTexto =
        (projeto.nomeProjeto || '').toLowerCase().includes(filtroLower) ||
        (projeto.nomeOrientador || '').toLowerCase().includes(filtroLower) ||
        (projeto.campus || '').toLowerCase().includes(filtroLower);

      // em orientador não usamos filtro de status (botões somem no HTML)
      const combinaStatus = !this.filtroStatus || (projeto as any).status === this.filtroStatus;

      return combinaTexto && combinaStatus;
    });
  }

  // ✅ Métodos auxiliares para o template
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
    return 30 + (index % 3) * 20; // apenas visual
  }

  getCor(index: number): string {
    const cores = ['#007bff', '#28a745', '#ffc107'];
    return cores[index % cores.length];
  }

  // ✅ Excluir/Editar (somente secretaria)
  excluirProjeto(projeto: Projeto | number): void {
    if (this.isOrientador) {
      this.snackBar.open('Somente a Secretaria pode excluir projetos.', 'Fechar', { duration: 3000 });
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
      alert('Erro: ID do projeto não foi encontrado ou é inválido. Recarregue a página e tente novamente.');
      return;
    }
    if (!projetoObj) {
      alert('Erro: Projeto não encontrado. Recarregue a página e tente novamente.');
      return;
    }

    const nomeExibicao = projetoObj.nomeProjeto || 'Desconhecido';
    const confirmacao = confirm(`Tem certeza que deseja excluir o projeto "${nomeExibicao}"?\n\nID: ${id}`);
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
        if (error.status === 0) mensagemErro = 'Erro de conexão: verifique se a API está rodando';
        else if (error.status === 404) mensagemErro = 'Projeto não encontrado no servidor';
        else if (error.status === 422) mensagemErro = 'ID do projeto é inválido';
        else if (error.status >= 500) mensagemErro = 'Erro interno do servidor';
        else mensagemErro = error.message || `Erro HTTP ${error.status}`;

        this.snackBar.open(`Erro ao excluir projeto: ${mensagemErro}`, 'Fechar', { duration: 4000 });
      },
    });
  }

  editarProjeto(id: number): void {
    if (this.isOrientador) {
      this.snackBar.open('Somente a Secretaria pode editar projetos.', 'Fechar', { duration: 3000 });
      return;
    }
    if (!this.isIdValido(id)) {
      alert('Erro: ID do projeto é inválido');
      return;
    }
    this.router.navigate(['/secretaria/projetos/editar', id]);
  }

  // 👉 Orientador: ir para relatórios do projeto
  irParaRelatorio(projeto: Projeto): void {
    const id = projeto?.id;
    if (!this.isIdValido(id)) {
      alert('Projeto sem ID válido.');
      return;
    }
    this.router.navigate(['/orientador/relatorios', id]);
  }

  // ✅ Recarregar lista
  recarregar(): void {
    this.carregarProjetos();
  }

  // ✅ Helpers de ID/status
  temIdValido(projeto: Projeto): boolean {
    return this.isIdValido(projeto.id);
  }

  private isIdValido(id: any): id is number {
    return id !== undefined && id !== null && typeof id === 'number' && !isNaN(id) && id > 0;
  }

  getStatusProjeto(projeto: Projeto): string {
    if (!this.temIdValido(projeto)) return 'erro';
    if (projeto.nomesAlunos.length >= (projeto.quantidadeMaximaAlunos || 0)) return 'lotado';
    if (projeto.nomesAlunos.length > 0) return 'em-andamento';
    return 'disponivel';
  }

  getCorStatus(status: string): string {
    switch (status) {
      case 'disponivel': return '#28a745';
      case 'em-andamento': return '#ffc107';
      case 'lotado': return '#dc3545';
      case 'erro': return '#6c757d';
      default: return '#007bff';
    }
  }

  getTextoStatus(status: string): string {
    switch (status) {
      case 'disponivel': return 'Disponível';
      case 'em-andamento': return 'Em andamento';
      case 'lotado': return 'Lotado';
      case 'erro': return 'Erro';
      default: return 'Desconhecido';
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
      projetosComIdValido: this.projetos.filter((p) => this.temIdValido(p)).length,
      projetos: this.projetos.map((p) => ({
        id: p.id, tipoId: typeof p.id, nome: p.nomeProjeto,
        temIdValido: this.temIdValido(p), status: this.getStatusProjeto(p),
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
