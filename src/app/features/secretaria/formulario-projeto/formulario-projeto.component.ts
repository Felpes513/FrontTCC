import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ProjetoService } from '@services/projeto.service';
import type { ProjetoCadastro, ProjetoDetalhado } from '@interfaces/projeto';
import type { Orientador } from '@interfaces/orientador';
import type { Aluno } from '@interfaces/aluno';
import type { Campus } from '@interfaces/campus';
import { ListagemAlunosComponent } from '../listagem-alunos/listagem-alunos.component';

@Component({
  selector: 'app-formulario-projeto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ListagemAlunosComponent],
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
  buscaOrientador = '';
  emailOrientador = '';
  orientadorSelecionadoId = 0;

  alunosInscritos: Aluno[] = [];

  campusList: Campus[] = [];
  campusFiltrados: Campus[] = [];
  campusSelecionadoId = 0;

  carregando = false;
  erro: string | null = null;
  modoEdicao = false;
  projetoId = 0;

  // Modo orientador
  isOrientadorMode = false;

  // Seleção de alunos (somente para orientador)
  inscricoes: any[] = [];
  aprovadas: any[] = [];
  pendentesOuReprovadas: any[] = [];
  selecionados = new Set<number>();
  limite = 0;
  salvandoSelecao = false;
  erroSalvarSelecao = '';
  sucessoSelecao = '';

  // Upload
  arquivoDocx?: File;
  arquivoPdf?: File;

  constructor(
    private projetoService: ProjetoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isOrientadorMode =
      (this.route.snapshot.data['modo'] || '').toUpperCase() === 'ORIENTADOR';

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
        this.router.navigate([
          this.isOrientadorMode ? '/orientador/projetos' : '/secretaria/projetos',
        ]);
      }
    }
  }

  /** Preenche o form usando apenas GET /projetos/ e cruzando por nome (sem normalização) */
  private carregarProjeto(id: number): void {
    this.carregando = true;
    this.erro = null;

    forkJoin({
      projetos: this.projetoService.listarProjetosRaw(),
      orientadores: this.projetoService.listarOrientadores(),
      campus: this.projetoService.listarCampus(),
    }).subscribe({
      next: ({ projetos, orientadores, campus }) => {
        // 1) projeto pelo id_projeto
        const p = (projetos || []).find(
          (x: any) => Number(x.id_projeto) === Number(id)
        );
        if (!p) {
          this.erro = 'Projeto não encontrado';
          this.carregando = false;
          return;
        }

        // 2) campos básicos
        this.projeto.titulo_projeto = p.titulo_projeto || '';
        this.projeto.resumo = p.resumo || '';

        // 3) orientador pelo nome
        const o = (orientadores || []).find(
          (x: any) =>
            (x.nome_completo || '').trim().toLowerCase() ===
            (p.orientador || '').trim().toLowerCase()
        );
        this.orientadorSelecionadoId = o?.id || 0;
        this.projeto.orientador_nome = p.orientador || o?.nome_completo || '';
        this.emailOrientador = o?.email || '';

        // 4) campus pelo nome
        const c = (campus || []).find(
          (x: any) =>
            (x.campus || '').trim().toLowerCase() ===
            (p.campus || '').trim().toLowerCase()
        );
        this.campusSelecionadoId = c?.id_campus || 0;
        this.projeto.id_campus = this.campusSelecionadoId;

        // (se for usar o modo orientador, chame aqui carregarInscricoesOrientador)
        this.carregando = false;
      },
      error: (e) => {
        console.error('Erro ao carregar dados para edição:', e);
        this.erro = 'Falha ao carregar dados do projeto';
        this.carregando = false;
      },
    });
  }

  // (Opcional) modo orientador
  private carregarInscricoesOrientador(
    idProjeto: number,
    projeto?: ProjetoDetalhado
  ) {
    this.projetoService.listarInscricoesPorProjeto(idProjeto).subscribe({
      next: (inscricoes) => {
        this.inscricoes = Array.isArray(inscricoes) ? inscricoes : [];
        this.aprovadas = this.inscricoes.filter((i) => this.isAprovada(i));
        this.pendentesOuReprovadas = this.inscricoes.filter(
          (i) => !this.isAprovada(i)
        );

        const jaNoProjetoIds = this.extractIdsFromAlunos(
          projeto?.alunos || projeto?.nomesAlunos || []
        );
        jaNoProjetoIds.forEach((id) => this.selecionados.add(id));
      },
      error: () => {
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
    if (this.isOrientadorMode) return;

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
    if (this.isOrientadorMode) return;
    if (!alunoId || alunoId <= 0) return;
    this.projetoService.aprovarAluno(alunoId).subscribe({
      next: () => {
        alert(`Aluno aprovado com sucesso!`);
        this.alunosInscritos = this.alunosInscritos.filter((a) => a.id !== alunoId);
      },
      error: () => alert('Erro ao aprovar aluno.'),
    });
  }

  excluirAluno(alunoId: number | undefined): void {
    if (this.isOrientadorMode) return;
    if (!alunoId || alunoId <= 0) return;
    if (!confirm('Tem certeza que deseja excluir este aluno?')) return;
    this.projetoService.excluirAluno(alunoId).subscribe({
      next: () => {
        alert(`Aluno excluído com sucesso!`);
        this.alunosInscritos = this.alunosInscritos.filter((a) => a.id !== alunoId);
      },
      error: () => alert('Erro ao excluir aluno.'),
    });
  }

  voltar(): void {
    this.router.navigate([
      this.isOrientadorMode ? '/orientador/projetos' : '/secretaria/projetos',
    ]);
  }

  limparFormulario(): void {
    if (this.isOrientadorMode) return;
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

  // utilitários do modo orientador
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

  private extractIdsFromAlunos(arr: any[]): number[] {
    if (!Array.isArray(arr)) return [];
    return arr
      .map((a: any) => a?.id ?? a?.id_aluno ?? a)
      .filter((v: any) => typeof v === 'number');
  }

  // ==== UPLOAD / DOWNLOAD (usa o service) ====

  onFileSelected(event: Event, tipo: 'docx' | 'pdf') {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (tipo === 'docx' && file.name.toLowerCase().endsWith('.docx')) {
      this.arquivoDocx = file;
    } else if (tipo === 'pdf' && file.name.toLowerCase().endsWith('.pdf')) {
      this.arquivoPdf = file;
    } else {
      alert(`Formato inválido. Envie um arquivo ${tipo.toUpperCase()}.`);
    }
  }

  enviarArquivo(tipo: 'docx' | 'pdf') {
    if (!this.projetoId) return alert('Salve o projeto antes de enviar arquivos.');

    const arquivo = tipo === 'docx' ? this.arquivoDocx : this.arquivoPdf;
    if (!arquivo) return alert(`Selecione um arquivo ${tipo.toUpperCase()} primeiro.`);

    const metodo =
      tipo === 'docx'
        ? this.projetoService.uploadDocx(this.projetoId, arquivo)
        : this.projetoService.uploadPdf(this.projetoId, arquivo);

    metodo.subscribe({
      next: () => alert(`${tipo.toUpperCase()} enviado com sucesso!`),
      error: (err) => alert(`Erro ao enviar ${tipo.toUpperCase()}: ${err.message}`),
    });
  }

  baixarArquivo(tipo: 'docx' | 'pdf') {
    if (!this.projetoId) return alert('Projeto não identificado.');
    const metodo =
      tipo === 'docx'
        ? this.projetoService.downloadDocx(this.projetoId)
        : this.projetoService.downloadPdf(this.projetoId);

    metodo.subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `projeto_${this.projetoId}.${tipo}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => alert(`Erro ao baixar ${tipo.toUpperCase()}: ${err.message}`),
    });
  }
}
