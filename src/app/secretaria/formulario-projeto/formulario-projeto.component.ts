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
  Campus
} from '../projeto.service';

@Component({
  selector: 'app-formulario-projeto',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './formulario-projeto.component.html',
  styleUrls: ['./formulario-projeto.component.css']
})
export class FormularioProjetoComponent implements OnInit {
  projeto: ProjetoCadastro = {
    titulo_projeto: '',
    resumo: '',
    orientador_nome: '',
    orientador_email: '',
    campus_nome: '',
    quantidadeMaximaAlunos: 0
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
        console.log('✅ Projeto carregado para edição:', projeto);
        this.projeto = {
          titulo_projeto: projeto.titulo_projeto || projeto.nomeProjeto,
          resumo: projeto.resumo || '',
          orientador_nome: projeto.nomeOrientador,
          orientador_email: projeto.orientador_email || '',
          campus_nome: projeto.campus,
          quantidadeMaximaAlunos: projeto.quantidadeMaximaAlunos
        };
        this.orientadorSelecionadoId = projeto.id_orientador || 0;
        this.emailOrientador = projeto.orientador_email || '';
        if (projeto.alunos && projeto.alunos.length > 0) {
          this.alunosInscritos = projeto.alunos.map((a: any) => ({
            id: a.id,
            nome: a.nome_completo,
            email: a.email,
            documentoNotasUrl: a.documentoNotasUrl
          }));
        }
        this.carregando = false;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar projeto:', error);
        this.erro = 'Erro ao carregar dados do projeto';
        this.carregando = false;
      }
    });
  }

  private carregarOrientadores(): void {
    this.projetoService.listarOrientadores().subscribe({
      next: (orientadores: Orientador[]) => {
        this.orientadores = orientadores;
        this.orientadoresFiltrados = orientadores;
        console.log('✅ Orientadores carregados:', orientadores);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar orientadores:', error);
      }
    });
  }

  private carregarCampus(): void {
    this.projetoService.listarCampus().subscribe({
      next: (lista: Campus[]) => {
        this.campus = lista;
        this.campusFiltrados = lista;
        console.log('✅ Campus carregados:', lista);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar campus:', error);
        this.erro = 'Erro ao carregar lista de campus';
      }
    });
  }

  filtrarOrientadores(): void {
    if (!this.buscaOrientador || this.buscaOrientador.trim() === '') {
      this.orientadoresFiltrados = this.orientadores;
      return;
    }
    const filtro = this.buscaOrientador.toLowerCase().trim();
    this.orientadoresFiltrados = this.orientadores.filter(orientador =>
      orientador.nome_completo.toLowerCase().includes(filtro)
    );
  }

  selecionarOrientador(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const orientadorId = Number(target.value);
    if (!orientadorId || isNaN(orientadorId)) return;
    this.orientadorSelecionadoId = orientadorId;
    const orientadorSelecionado = this.orientadores.find(o => o.id === orientadorId);
    if (orientadorSelecionado) {
      this.projeto.orientador_nome = orientadorSelecionado.nome_completo;
      this.projeto.orientador_email = orientadorSelecionado.email || '';
      this.emailOrientador = orientadorSelecionado.email || '';
      console.log('✅ Orientador selecionado:', orientadorSelecionado);
    }
  }

  selecionarCampus(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    const campusSelecionado = this.campus.find(c => c.id === id);
    if (campusSelecionado) {
      this.projeto.campus_nome = campusSelecionado.campus;
    }
  }

  salvarProjeto(): void {
    if (!this.validarFormulario()) return;
    this.carregando = true;
    this.erro = null;
    console.log('💾 Salvando projeto:', this.projeto);
    const operacao = this.modoEdicao
      ? this.projetoService.atualizarProjeto(this.projetoId, this.projeto)
      : this.projetoService.cadastrarProjetoCompleto(this.projeto);
    operacao.subscribe({
      next: (response) => {
        console.log('✅ Projeto salvo com sucesso:', response);
        alert(this.modoEdicao ? 'Projeto atualizado com sucesso!' : 'Projeto cadastrado com sucesso!');
        this.router.navigate(['/secretaria/projetos']);
      },
      error: (error) => {
        console.error('❌ Erro ao salvar projeto:', error);
        this.erro = error.message || 'Erro ao salvar projeto';
        this.carregando = false;
      }
    });
  }

  private validarFormulario(): boolean {
    if (!this.projeto.titulo_projeto?.trim()) {
      alert('Por favor, informe o título do projeto');
      return false;
    }
    if (!this.projeto.orientador_nome?.trim()) {
      alert('Por favor, selecione um orientador');
      return false;
    }
    if (!this.projeto.campus_nome?.trim()) {
      alert('Por favor, informe o campus');
      return false;
    }
    return true;
  }

  aprovarAluno(alunoId: number | undefined): void {
    if (!alunoId || alunoId <= 0) return;
    this.projetoService.aprovarAluno(alunoId).subscribe({
      next: () => {
        alert(`Aluno aprovado com sucesso!`);
        this.alunosInscritos = this.alunosInscritos.filter(a => a.id !== alunoId);
      },
      error: () => alert('Erro ao aprovar aluno.')
    });
  }

  excluirAluno(alunoId: number | undefined): void {
    if (!alunoId || alunoId <= 0) return;
    if (!confirm('Tem certeza que deseja excluir este aluno?')) return;
    this.projetoService.excluirAluno(alunoId).subscribe({
      next: () => {
        alert(`Aluno excluído com sucesso!`);
        this.alunosInscritos = this.alunosInscritos.filter(a => a.id !== alunoId);
      },
      error: () => alert('Erro ao excluir aluno.')
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
      campus_nome: '',
      quantidadeMaximaAlunos: 0
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
