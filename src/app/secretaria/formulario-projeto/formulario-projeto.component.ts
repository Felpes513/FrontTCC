import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import {
  ProjetoService,
  ProjetoCadastro,
  ProjetoDetalhado,
  Orientador,
  Aluno,
  Campus,
} from '../projeto.service';

@Component({
  selector: 'app-formulario-projeto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
  campus: Campus[] = [];
  campusFiltrados: Campus[] = [];
  campusSelecionadoId: number = 0;

  carregando: boolean = false;
  erro: string | null = null;
  modoEdicao: boolean = false;
  projetoId: number = 0;

  constructor(
    private projetoService: ProjetoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
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
        this.router.navigate(['/secretaria/projetos']);
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

        if (projeto.alunos && projeto.alunos.length > 0) {
          this.alunosInscritos = projeto.alunos.map((a: any) => ({
            id: a.id,
            nome: a.nome_completo,
            email: a.email,
            documentoNotasUrl: a.documentoNotasUrl,
          }));
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

  private carregarOrientadores(): void {
    this.projetoService.listarOrientadores().subscribe({
      next: (orientadores: Orientador[]) => {
        this.orientadores = orientadores;
        this.orientadoresFiltrados = orientadores;
      },
      error: (error) => {
        console.error('Erro ao carregar orientadores:', error);
      },
    });
  }

  private carregarCampus(): void {
    this.projetoService.listarCampus().subscribe({
      next: (res: Campus[]) => {
        this.campus = res;
        this.campusFiltrados = res;
      },
      error: (error) => {
        console.error('Erro ao carregar campus:', error);
        this.erro = 'Erro ao carregar lista de campus';
      },
    });
  }

  filtrarOrientadores(): void {
    const filtro = this.buscaOrientador.toLowerCase().trim();
    this.orientadoresFiltrados = this.orientadores.filter((o) =>
      o.nome_completo.toLowerCase().includes(filtro)
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
    const campusSelecionado = this.campus.find((c) => c.id_campus === id);
    if (campusSelecionado) {
      this.projeto.id_campus = campusSelecionado.id_campus;
    }
  }

  salvarProjeto(): void {
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
        this.erro = error.message || 'Erro ao salvar projeto';
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
    if (!this.projeto.orientador_nome?.trim()) {
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
    this.router.navigate(['/secretaria/projetos']);
  }

  limparFormulario(): void {
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
    this.orientadoresFiltrados = this.orientadores;
    this.alunosInscritos = [];
    this.erro = null;
  }

  get tituloPagina(): string {
    return this.modoEdicao ? 'Editar Projeto' : 'Cadastrar Projeto';
  }

  get textoBotao(): string {
    return this.modoEdicao ? 'Atualizar Projeto' : 'Cadastrar Projeto';
  }
}
