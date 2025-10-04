import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ProjetoService } from '@services/projeto.service';
import type { ProjetoCadastro, ProjetoDetalhado } from '@interfaces/projeto';
import type { Orientador } from '@interfaces/orientador';
import type { Aluno } from '@interfaces/aluno';
import type { Campus } from '@interfaces/campus';
import { ListagemAlunosComponent } from '../listagem-alunos/listagem-alunos.component';

@Component({
  selector: 'app-formulario-projeto',
  standalone: true,
  imports: [ CommonModule, FormsModule, RouterModule, ListagemAlunosComponent ],
  templateUrl: './formulario-projeto.component.html',
  styleUrls: ['./formulario-projeto.component.css'],
})
export class FormularioProjetoComponent implements OnInit {
  projeto: ProjetoCadastro = {
    titulo_projeto: '',
    resumo: '',
    orientador_nome: '',
    orientador_email: '',
    quantidadeMaximaAlunos: 0,
    id_campus: 0,
  };

  orientadores: Orientador[] = [];
  orientadoresFiltrados: Orientador[] = [];
  buscaOrientador: string = '';
  emailOrientador: string = '';
  orientadorSelecionadoId: number = 0;

  alunosInscritos: Aluno[] = [];

  campusList: Campus[] = [];
  campusFiltrados: Campus[] = [];
  campusSelecionadoId: number = 0;

  carregando: boolean = false;
  erro: string | null = null;
  modoEdicao: boolean = false;
  projetoId: number = 0;

  // 🆕 Modo orientador
  isOrientadorMode = false;

  // 🆕 Seleção de alunos (somente para orientador)
  inscricoes: any[] = [];
  aprovadas: any[] = [];
  pendentesOuReprovadas: any[] = [];
  selecionados = new Set<number>();
  limite = 0;
  salvandoSelecao = false;
  erroSalvarSelecao = '';
  sucessoSelecao = '';

  constructor(
    private projetoService: ProjetoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // 🆕 detectar modo via data da rota
    this.isOrientadorMode = (this.route.snapshot.data['modo'] || '').toUpperCase() === 'ORIENTADOR';

    this.carregarOrientadores();
    this.verificarModoEdicao();
    this.carregarCampus();
  }

  private verificarModoEdicao(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      const projetoId = Number(id);
      if (!isNaN(projetoId) && projetoId > 0) {
        this.projetoId = projetoId;
        this.modoEdicao = true;
        this.carregarProjeto(projetoId);
      } else {
        console.error('ID do projeto inválido:', id);
        this.router.navigate([ this.isOrientadorMode ? '/orientador/projetos' : '/secretaria/projetos' ]);
      }
    }
  }

  private carregarProjeto(id: number): void {
    this.carregando = true;
    this.erro = null;

    this.projetoService.getProjetoDetalhado(id).subscribe({
      next: (projeto: ProjetoDetalhado) => {
        this.projeto = {
          titulo_projeto: projeto.titulo_projeto || projeto.nomeProjeto,
          resumo: projeto.resumo || '',
          orientador_nome: projeto.nomeOrientador,
          orientador_email: projeto.orientador_email || '',
          quantidadeMaximaAlunos: projeto.quantidadeMaximaAlunos,
          id_campus: projeto.id_campus || 0,
        };

        this.orientadorSelecionadoId = projeto.id_orientador || 0;
        this.emailOrientador = projeto.orientador_email || '';
        this.campusSelecionadoId = projeto.id_campus || 0;

        // Secretaria: lista alunos atuais no projeto
        if (!this.isOrientadorMode) {
          if (Array.isArray(projeto.alunos) && projeto.alunos.length > 0) {
            this.alunosInscritos = projeto.alunos.map((a: any) => ({
              id: a.id,
              nome: a.nome_completo ?? a.nome,
              email: a.email,
              documentoNotasUrl: a.documentoNotasUrl,
            }));
          } else {
            this.alunosInscritos = [];
          }
        }

        // 🆕 Orientador: carrega inscrições e pré-seleciona
        if (this.isOrientadorMode) {
          this.limite = Number(projeto?.quantidadeMaximaAlunos || 0);
          this.carregarInscricoesOrientador(id, projeto);
        }

        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao carregar projeto:', error);
        this.erro = 'Erro ao carregar dados do projeto';
        this.carregando = false;
      },
    });
  }

  // 🆕 (orientador) buscar inscrições e separar por status
  private carregarInscricoesOrientador(idProjeto: number, projeto?: ProjetoDetalhado) {
    this.projetoService.listarInscricoesPorProjeto(idProjeto).subscribe({
      next: (inscricoes) => {
        this.inscricoes = Array.isArray(inscricoes) ? inscricoes : [];
        this.aprovadas = this.inscricoes.filter((i) => this.isAprovada(i));
        this.pendentesOuReprovadas = this.inscricoes.filter((i) => !this.isAprovada(i));

        const jaNoProjetoIds = this.extractIdsFromAlunos(projeto?.alunos || projeto?.nomesAlunos || []);
        jaNoProjetoIds.forEach((id) => this.selecionados.add(id));
      },
      error: () => {
        // falha em inscrições não deve travar a tela
        this.inscricoes = [];
        this.aprovadas = [];
        this.pendentesOuReprovadas = [];
      },
    });
  }

  private carregarOrientadores(): void {
    this.projetoService.listarOrientadores().subscribe({
      next: (orientadores: Orientador[]) => {
        this.orientadores = Array.isArray(orientadores) ? orientadores : [];
        this.orientadoresFiltrados = [...this.orientadores];
      },
      error: (error) => {
        console.error('Erro ao carregar orientadores:', error);
        this.orientadores = [];
        this.orientadoresFiltrados = [];
      },
    });
  }

  private carregarCampus(): void {
    this.projetoService.listarCampus().subscribe({
      next: (res: Campus[]) => {
        this.campusList = Array.isArray(res) ? res : [];
        this.campusFiltrados = [...this.campusList];
      },
      error: (error) => {
        console.error('Erro ao carregar campus:', error);
        this.erro = 'Erro ao carregar lista de campus';
        this.campusList = [];
        this.campusFiltrados = [];
      },
    });
  }

  filtrarOrientadores(): void {
    const filtro = this.buscaOrientador.toLowerCase().trim();
    this.orientadoresFiltrados = this.orientadores.filter((o) =>
      (o.nome_completo || '').toLowerCase().includes(filtro)
    );
  }

  selecionarOrientador(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const orientadorId = Number(target.value);
    if (!orientadorId || isNaN(orientadorId)) return;

    this.orientadorSelecionadoId = orientadorId;

    const orientadorSelecionado = this.orientadores.find(
      (o) => o.id === orientadorId
    );
    if (orientadorSelecionado) {
      this.projeto.orientador_nome = orientadorSelecionado.nome_completo;
      this.projeto.orientador_email = orientadorSelecionado.email || '';
      this.emailOrientador = orientadorSelecionado.email || '';
    }
  }

  selecionarCampus(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    const campusSelecionado = this.campusList.find((c) => c.id_campus === id);
    if (campusSelecionado) {
      this.projeto.id_campus = campusSelecionado.id_campus;
      this.campusSelecionadoId = campusSelecionado.id_campus;
    }
  }

  salvarProjeto(): void {
    if (this.isOrientadorMode) return; // 🆕 orientador não edita projeto

    if (!this.validarFormulario()) return;

    this.carregando = true;
    this.erro = null;

    const operacao = this.modoEdicao
      ? this.projetoService.atualizarProjeto(this.projetoId, this.projeto)
      : this.projetoService.cadastrarProjetoCompleto(
          this.projeto,
          this.orientadorSelecionadoId
        );

    operacao.subscribe({
      next: () => {
        alert(
          this.modoEdicao
            ? 'Projeto atualizado com sucesso!'
            : 'Projeto cadastrado com sucesso!'
        );
        this.router.navigate(['/secretaria/projetos']);
      },
      error: (error) => {
        console.error('Erro ao salvar projeto:', error);
        this.erro = error?.message || 'Erro ao salvar projeto';
        this.carregando = false;
      },
    });
  }

  private validarFormulario(): boolean {
    if (!this.projeto.titulo_projeto?.trim()) {
      alert('Por favor, informe o título do projeto');
      return false;
    }
    if (!this.projeto.resumo?.trim()) {
      alert('Por favor, preencha o resumo do projeto');
      return false;
    }
    if (!this.projeto.orientador_nome?.trim() || !this.orientadorSelecionadoId) {
      alert('Por favor, selecione um orientador');
      return false;
    }
    if (!this.projeto.id_campus || this.projeto.id_campus <= 0) {
      alert('Por favor, selecione um campus');
      return false;
    }
    return true;
  }

  aprovarAluno(alunoId: number | undefined): void {
    if (this.isOrientadorMode) return; // 🆕 orientador não aprova
    if (!alunoId || alunoId <= 0) return;
    this.projetoService.aprovarAluno(alunoId).subscribe({
      next: () => {
        alert(`Aluno aprovado com sucesso!`);
        this.alunosInscritos = this.alunosInscritos.filter(
          (a) => a.id !== alunoId
        );
      },
      error: () => alert('Erro ao aprovar aluno.'),
    });
  }

  excluirAluno(alunoId: number | undefined): void {
    if (this.isOrientadorMode) return; // 🆕 orientador não exclui
    if (!alunoId || alunoId <= 0) return;
    if (!confirm('Tem certeza que deseja excluir este aluno?')) return;
    this.projetoService.excluirAluno(alunoId).subscribe({
      next: () => {
        alert(`Aluno excluído com sucesso!`);
        this.alunosInscritos = this.alunosInscritos.filter(
          (a) => a.id !== alunoId
        );
      },
      error: () => alert('Erro ao excluir aluno.'),
    });
  }

  voltar(): void {
    this.router.navigate([ this.isOrientadorMode ? '/orientador/projetos' : '/secretaria/projetos' ]);
  }

  limparFormulario(): void {
    if (this.isOrientadorMode) return; // 🆕 sem limpar no modo orientador
    this.projeto = {
      titulo_projeto: '',
      resumo: '',
      orientador_nome: '',
      orientador_email: '',
      quantidadeMaximaAlunos: 0,
      id_campus: 0,
    };
    this.orientadorSelecionadoId = 0;
    this.emailOrientador = '';
    this.buscaOrientador = '';
    this.orientadoresFiltrados = [...this.orientadores];
    this.alunosInscritos = [];
    this.campusSelecionadoId = 0;
    this.erro = null;
  }

  get tituloPagina(): string {
    if (this.isOrientadorMode) return 'Selecionar alunos do projeto';
    return this.modoEdicao ? 'Editar Projeto' : 'Cadastrar Projeto';
  }

  get textoBotao(): string {
    if (this.isOrientadorMode) return 'Salvar seleção';
    return this.modoEdicao ? 'Atualizar Projeto' : 'Cadastrar Projeto';
  }

  // 🆕 utilitários do modo orientador
  isAprovada(i: any): boolean {
    const s = String(i?.status || i?.situacao || '').toUpperCase();
    return s === 'APROVADO' || s === 'APROVADA' || i?.aprovado === true;
  }
  isPendente(i: any): boolean {
    const s = String(i?.status || i?.situacao || 'PENDENTE').toUpperCase();
    return s.includes('PENDENTE');
  }
  isReprovada(i: any): boolean {
    const s = String(i?.status || i?.situacao || '').toUpperCase();
    return s.startsWith('REPROV');
  }
  alunoId(i: any): number {
    return i?.id_aluno ?? i?.aluno_id ?? i?.idAluno ?? i?.aluno?.id ?? i?.id ?? 0;
  }
  alunoNome(i: any): string {
    return i?.aluno?.nome || i?.nome_aluno || i?.nome || i?.aluno_nome || `Aluno #${this.alunoId(i)}`;
  }
  disabledCheckbox(i: any): boolean {
    const id = this.alunoId(i);
    if (this.selecionados.has(id)) return false;
    if (!this.limite) return false;
    return this.selecionados.size >= this.limite;
  }
  toggleSelecionado(i: any, checked: boolean) {
    const id = this.alunoId(i);
    if (!id) return;
    if (checked) {
      if (this.limite && this.selecionados.size >= this.limite) return;
      this.selecionados.add(id);
    } else {
      this.selecionados.delete(id);
    }
  }
  salvarSelecao(): void {
    if (!this.isOrientadorMode || !this.projetoId) return;
    this.sucessoSelecao = ''; this.erroSalvarSelecao = '';
    this.salvandoSelecao = true;
    const ids = Array.from(this.selecionados);
    this.projetoService.updateAlunosProjeto(this.projetoId, ids).subscribe({
      next: () => {
        this.salvandoSelecao = false;
        this.sucessoSelecao = 'Alunos atualizados com sucesso!';
      },
      error: (e) => {
        this.salvandoSelecao = false;
        this.erroSalvarSelecao = e?.message || 'Falha ao salvar seleção.';
      }
    });
  }

  private extractIdsFromAlunos(arr: any[]): number[] {
    if (!Array.isArray(arr)) return [];
    return arr.map((a: any) => a?.id ?? a?.id_aluno ?? a).filter((v: any) => typeof v === 'number');
  }
}
