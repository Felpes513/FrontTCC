import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProjetoService, Projeto } from '../projeto.service';

@Component({
  selector: 'app-listagem-projetos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './listagem-projetos.component.html',
  styleUrls: ['./listagem-projetos.component.css'],
})
export class ListagemProjetosComponent implements OnInit {
  projetos: Projeto[] = [];
  filtro: string = '';
  carregando: boolean = false;
  erro: string | null = null;
  filtroStatus: string = '';

  constructor(private projetoService: ProjetoService, private router: Router) {}

  trackByFn(index: number, item: Projeto): any {
    return item.id || index;
  }

  ngOnInit(): void {
    this.carregarProjetos();
  }

  // ✅ Método de carregamento atualizado
  carregarProjetos(): void {
    this.carregando = true;
    this.erro = null;

    console.log('🔄 Iniciando carregamento dos projetos via API FastAPI...');

    this.projetoService.listarProjetos().subscribe({
      next: (projetos) => {
        console.log('✅ Projetos processados e normalizados:', projetos);

        // Verificar se todos os projetos têm IDs válidos
        const projetosComIdInvalido = projetos.filter(
          (p) => !p.id || p.id <= 0
        );
        if (projetosComIdInvalido.length > 0) {
          console.warn(
            '⚠️ Projetos com ID inválido encontrados:',
            projetosComIdInvalido
          );
        }

        this.projetos = projetos;
        this.carregando = false;

        // Debug final - resumo do que foi carregado
        console.log('📊 RESUMO FINAL DOS PROJETOS:', {
          totalProjetos: this.projetos.length,
          projetosComIdValido: this.projetos.filter((p) => p.id && p.id > 0)
            .length,
          projetosComOrientador: this.projetos.filter(
            (p) => p.nomeOrientador !== 'Orientador não informado'
          ).length,
          projetosComAlunos: this.projetos.filter(
            (p) => p.nomesAlunos.length > 0
          ).length,
          detalhePorProjeto: this.projetos.map((p) => ({
            id: p.id,
            nome: p.nomeProjeto,
            orientador: p.nomeOrientador,
            qtdAlunos: p.nomesAlunos.length,
            idValido: this.temIdValido(p),
          })),
        });
      },
      error: (error) => {
        console.error('❌ Erro ao carregar projetos:', error);

        // Mensagem de erro mais detalhada baseada no status HTTP
        if (error.status === 0) {
          this.erro =
            'Erro de conexão: Verifique se a API FastAPI está rodando na porta 8000.';
        } else if (error.status === 404) {
          this.erro =
            'Endpoint não encontrado: Verifique se a rota /projetos está configurada corretamente.';
        } else if (error.status >= 500) {
          this.erro =
            'Erro interno do servidor: Verifique os logs da API FastAPI.';
        } else {
          this.erro = error.message || 'Erro desconhecido ao carregar projetos';
        }

        this.carregando = false;
      },
    });
  }

  // ✅ Filtro de projetos
  projetosFiltrados(): Projeto[] {
    const filtroLower = this.filtro.toLowerCase().trim();

    return this.projetos.filter((projeto) => {
      const combinaTexto =
        projeto.nomeProjeto.toLowerCase().includes(filtroLower) ||
        projeto.nomeOrientador?.toLowerCase().includes(filtroLower) ||
        projeto.campus.toLowerCase().includes(filtroLower);

      const combinaStatus =
        !this.filtroStatus || projeto.status === this.filtroStatus;

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
    return projeto.quantidadeMaximaAlunos > 0;
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

  // ✅ Excluir projeto - ATUALIZADO para trabalhar com a nova estrutura
  excluirProjeto(projeto: Projeto | number): void {
    let id: number;
    let projetoObj: Projeto | null = null;

    // Extrair ID e objeto do projeto
    if (typeof projeto === 'number') {
      id = projeto;
      projetoObj = this.projetos.find((p) => p.id === id) || null;
    } else {
      id = projeto.id;
      projetoObj = projeto;
    }

    // Debug detalhado
    console.log('🔍 DEBUG EXCLUSÃO DETALHADO:', {
      parametroRecebido: projeto,
      tipoParametro: typeof projeto,
      idExtraido: id,
      tipoId: typeof id,
      idEhNumero: typeof id === 'number',
      idEhNaN: isNaN(id),
      idMaiorQueZero: id > 0,
      projetoEncontrado: projetoObj
        ? { id: projetoObj.id, nome: projetoObj.nomeProjeto }
        : null,
      listaTodosIds: this.projetos.map((p) => ({
        id: p.id,
        tipo: typeof p.id,
        nome: p.nomeProjeto,
      })),
    });

    // Validação rigorosa do ID
    if (!this.isIdValido(id)) {
      console.error('❌ ID INVÁLIDO:', {
        id,
        tipo: typeof id,
        isNaN: isNaN(id),
        ehUndefined: id === undefined,
        ehNull: id === null,
        ehZero: id === 0,
        ehNegativo: id < 0,
      });

      alert(
        'Erro: ID do projeto não foi encontrado ou é inválido. Recarregue a página e tente novamente.'
      );
      return;
    }

    if (!projetoObj) {
      console.error('❌ Projeto não encontrado na lista local com ID:', id);
      alert(
        'Erro: Projeto não encontrado. Recarregue a página e tente novamente.'
      );
      return;
    }

    // Confirmação de exclusão
    const nomeExibicao = projetoObj.nomeProjeto || 'Desconhecido';
    const confirmacao = confirm(
      `Tem certeza que deseja excluir o projeto "${nomeExibicao}"?\n\nID: ${id}`
    );

    if (!confirmacao) {
      console.log('❌ Exclusão cancelada pelo usuário');
      return;
    }

    console.log('🗑️ Iniciando exclusão do projeto:', {
      id,
      nome: nomeExibicao,
      url: `projetos/${id}`,
    });

    // Executar exclusão
    this.projetoService.excluirProjeto(id).subscribe({
      next: (response) => {
        console.log('✅ Projeto excluído com sucesso:', response);

        // Remover da lista local
        const indexRemover = this.projetos.findIndex((p) => p.id === id);
        if (indexRemover !== -1) {
          this.projetos.splice(indexRemover, 1);
          console.log(
            '✅ Projeto removido da lista local. Projetos restantes:',
            this.projetos.length
          );
        }

        // Exibir mensagem de sucesso
        const mensagem = response?.mensagem || 'Projeto excluído com sucesso!';
        alert(mensagem);
      },
      error: (error) => {
        console.error('❌ ERRO DETALHADO NA EXCLUSÃO:', error);

        // Análise detalhada do erro
        console.error('❌ Análise do erro:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          detail: error.error?.detail,
          url: error.url,
          errorCompleto: error,
        });

        // Mensagem de erro específica
        let mensagemErro = '';

        if (error.status === 0) {
          mensagemErro = 'Erro de conexão: Verifique se a API está rodando';
        } else if (error.status === 404) {
          mensagemErro = 'Projeto não encontrado no servidor';
        } else if (error.status === 422) {
          mensagemErro = 'ID do projeto é inválido';
        } else if (error.status >= 500) {
          mensagemErro = 'Erro interno do servidor';
        } else {
          mensagemErro = error.message || `Erro HTTP ${error.status}`;
        }

        alert(`Erro ao excluir projeto: ${mensagemErro}`);
      },
    });
  }

  // ✅ Editar projeto
  editarProjeto(id: number): void {
    if (!this.isIdValido(id)) {
      alert('Erro: ID do projeto é inválido');
      return;
    }

    console.log('📝 Navegando para editar projeto ID:', id);
    this.router.navigate(['/secretaria/projetos/editar', id]);
  }

  // ✅ Visualizar detalhes do projeto
  verDetalhes(id: number): void {
    if (!this.isIdValido(id)) {
      alert('Erro: ID do projeto é inválido');
      return;
    }

    console.log('👁️ Navegando para visualizar projeto ID:', id);
    this.router.navigate(['/secretaria/projetos/detalhes', id]);
  }

  // ✅ Ver inscrições do projeto
  verInscricoes(id: number): void {
    if (!this.isIdValido(id)) {
      alert('Erro: ID do projeto é inválido');
      return;
    }

    console.log('📋 Navegando para inscrições do projeto ID:', id);
    this.router.navigate(['/secretaria/projetos/inscricoes', id]);
  }

  // ✅ Recarregar lista
  recarregar(): void {
    console.log('🔄 Recarregando lista de projetos...');
    this.carregarProjetos();
  }

  // ✅ Método para verificar se o projeto tem ID válido
  temIdValido(projeto: Projeto): boolean {
    return this.isIdValido(projeto.id);
  }

  // ✅ Validador de ID centralizado
  private isIdValido(id: any): boolean {
    return (
      id !== undefined &&
      id !== null &&
      typeof id === 'number' &&
      !isNaN(id) &&
      id > 0
    );
  }

  // ✅ Método para obter status do projeto baseado nos dados
  getStatusProjeto(projeto: Projeto): string {
    if (!this.temIdValido(projeto)) {
      return 'erro';
    }

    if (projeto.nomesAlunos.length >= projeto.quantidadeMaximaAlunos) {
      return 'lotado';
    }

    if (projeto.nomesAlunos.length > 0) {
      return 'em-andamento';
    }

    return 'disponivel';
  }

  // ✅ Método para obter cor do status
  getCorStatus(status: string): string {
    switch (status) {
      case 'disponivel':
        return '#28a745'; // Verde
      case 'em-andamento':
        return '#ffc107'; // Amarelo
      case 'lotado':
        return '#dc3545'; // Vermelho
      case 'erro':
        return '#6c757d'; // Cinza
      default:
        return '#007bff'; // Azul padrão
    }
  }

  // ✅ Método para obter texto do status
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

  // ✅ Método para calcular progresso das inscrições
  calcularProgresso(projeto: Projeto): number {
    if (projeto.quantidadeMaximaAlunos === 0) {
      return 0;
    }

    const progresso =
      (projeto.nomesAlunos.length / projeto.quantidadeMaximaAlunos) * 100;
    return Math.min(progresso, 100);
  }

  // ✅ Métodos de debug (podem ser removidos em produção)
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

  // ✅ Método para exportar lista de projetos (funcionalidade extra)
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
    // Aqui você pode implementar a exportação para CSV, Excel, etc.
  }
}
