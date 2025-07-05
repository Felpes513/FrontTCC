import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import {
  ProjetoService,
  ProjetoCadastro,
  ProjetoDetalhado,
  Orientador,
  Aluno
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
  // ✅ Propriedades do projeto - usando interface correta
  projeto: ProjetoCadastro = {
    titulo_projeto: '',
    resumo: '',
    orientador_nome: '',
    orientador_email: '',
    campus_nome: '',
    quantidadeMaximaAlunos: 0
  };

  // ✅ Propriedades para orientadores
  orientadores: Orientador[] = [];
  orientadoresFiltrados: Orientador[] = [];
  buscaOrientador: string = '';
  emailOrientador: string = '';

  // ✅ ID do orientador selecionado - corrigido para não ser undefined
  orientadorSelecionadoId: number = 0;

  // ✅ Propriedades para alunos
  alunosInscritos: Aluno[] = [];

  // ✅ Controle de estado
  carregando: boolean = false;
  erro: string | null = null;
  modoEdicao: boolean = false;

  // ✅ ID do projeto para edição - corrigido para não ser undefined
  projetoId: number = 0;

  constructor(
    private projetoService: ProjetoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.carregarOrientadores();
    this.verificarModoEdicao();
  }

  // ✅ Verificar se está em modo de edição
  private verificarModoEdicao(): void {
    const id = this.route.snapshot.params['id'];

    if (id) {
      // ✅ Conversão segura para number
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

  // ✅ Carregar projeto para edição
  private carregarProjeto(id: number): void {
    this.carregando = true;
    this.erro = null;

    this.projetoService.getProjetoDetalhado(id).subscribe({
      next: (projeto: ProjetoDetalhado) => {
        console.log('✅ Projeto carregado para edição:', projeto);

        // Preencher o formulário com os dados do projeto
        this.projeto = {
          titulo_projeto: projeto.titulo_projeto || projeto.nomeProjeto,
          resumo: projeto.resumo || '',
          orientador_nome: projeto.nomeOrientador,
          orientador_email: projeto.orientador_email || '',
          campus_nome: projeto.campus,
          quantidadeMaximaAlunos: projeto.quantidadeMaximaAlunos
        };

        // ✅ Definir orientador selecionado com valor válido
        this.orientadorSelecionadoId = projeto.id_orientador || 0;
        this.emailOrientador = projeto.orientador_email || '';

        // Carregar alunos inscritos se houver
        if (projeto.alunos && projeto.alunos.length > 0) {
          this.alunosInscritos = (projeto.alunos || []).map((a: any) => ({
          id: a.id,
          nome: a.nome_completo, // <-- converte de 'nome_completo' para 'nome'
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

  // ✅ Carregar lista de orientadores
  private carregarOrientadores(): void {
    this.projetoService.listarOrientadores().subscribe({
      next: (orientadores: Orientador[]) => {
        this.orientadores = orientadores;
        this.orientadoresFiltrados = orientadores;
        console.log('✅ Orientadores carregados:', orientadores);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar orientadores:', error);
        // Não bloquear o formulário se não conseguir carregar orientadores
      }
    });
  }

  // ✅ Filtrar orientadores
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

  // ✅ Selecionar orientador - corrigido para garantir type safety
  selecionarOrientador(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const orientadorId = target.value;

    if (!orientadorId || orientadorId === '') {
      // Reset quando nenhum orientador é selecionado
      this.orientadorSelecionadoId = 0;
      this.emailOrientador = '';
      this.projeto.orientador_nome = '';
      this.projeto.orientador_email = '';
      return;
    }

    // ✅ Conversão segura para number
    const id = Number(orientadorId);

    if (isNaN(id) || id <= 0) {
      console.error('ID do orientador inválido:', orientadorId);
      return;
    }

    this.orientadorSelecionadoId = id;

    // Buscar dados do orientador selecionado
    const orientadorSelecionado = this.orientadores.find(o => o.id === id);

    if (orientadorSelecionado) {
      this.projeto.orientador_nome = orientadorSelecionado.nome_completo;
      this.projeto.orientador_email = orientadorSelecionado.email || '';
      this.emailOrientador = orientadorSelecionado.email || '';

      console.log('✅ Orientador selecionado:', orientadorSelecionado);
    } else {
      console.error('❌ Orientador não encontrado com ID:', id);
    }
  }

  // ✅ Salvar projeto
  salvarProjeto(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.carregando = true;
    this.erro = null;

    console.log('💾 Salvando projeto:', this.projeto);

    const operacao = this.modoEdicao
      ? this.projetoService.atualizarProjeto(this.projetoId, this.projeto)
      : this.projetoService.cadastrarProjetoCompleto(this.projeto);

    operacao.subscribe({
      next: (response) => {
        console.log('✅ Projeto salvo com sucesso:', response);

        const mensagem = this.modoEdicao
          ? 'Projeto atualizado com sucesso!'
          : 'Projeto cadastrado com sucesso!';

        alert(mensagem);

        // Redirecionar para a lista de projetos
        this.router.navigate(['/secretaria/projetos']);
      },
      error: (error) => {
        console.error('❌ Erro ao salvar projeto:', error);
        this.erro = error.message || 'Erro ao salvar projeto';
        this.carregando = false;
      }
    });
  }

  // ✅ Validar formulário
  private validarFormulario(): boolean {
    if (!this.projeto.titulo_projeto || this.projeto.titulo_projeto.trim() === '') {
      alert('Por favor, informe o título do projeto');
      return false;
    }

    if (!this.projeto.orientador_nome || this.projeto.orientador_nome.trim() === '') {
      alert('Por favor, selecione um orientador');
      return false;
    }

    if (!this.projeto.campus_nome || this.projeto.campus_nome.trim() === '') {
      alert('Por favor, informe o campus');
      return false;
    }

    return true;
  }

  // ✅ Aprovar aluno - corrigido para garantir type safety
  aprovarAluno(alunoId: number | undefined): void {
    if (!alunoId || alunoId <= 0) {
      console.error('ID do aluno inválido:', alunoId);
      alert('Erro: ID do aluno é inválido');
      return;
    }

    // ✅ Garantir que alunoId é number
    const id: number = Number(alunoId);

    if (isNaN(id) || id <= 0) {
      console.error('ID do aluno inválido após conversão:', alunoId);
      alert('Erro: ID do aluno é inválido');
      return;
    }

    console.log('✅ Aprovando aluno com ID:', id);

    // Aqui você implementaria a lógica para aprovar o aluno
    // Por exemplo, chamando um método do service
    alert(`Aluno com ID ${id} aprovado com sucesso!`);

    // Remover da lista de pendentes (exemplo)
    this.alunosInscritos = this.alunosInscritos.filter(a => a.id !== id);
  }

  // ✅ Excluir aluno - corrigido para garantir type safety
  excluirAluno(alunoId: number | undefined): void {
    if (!alunoId || alunoId <= 0) {
      console.error('ID do aluno inválido:', alunoId);
      alert('Erro: ID do aluno é inválido');
      return;
    }

    // ✅ Garantir que alunoId é number
    const id: number = Number(alunoId);

    if (isNaN(id) || id <= 0) {
      console.error('ID do aluno inválido após conversão:', alunoId);
      alert('Erro: ID do aluno é inválido');
      return;
    }

    const confirmacao = confirm('Tem certeza que deseja excluir este aluno?');

    if (!confirmacao) {
      return;
    }

    console.log('🗑️ Excluindo aluno com ID:', id);

    // Aqui você implementaria a lógica para excluir o aluno
    // Por exemplo, chamando um método do service
    alert(`Aluno com ID ${id} excluído com sucesso!`);

    // Remover da lista (exemplo)
    this.alunosInscritos = this.alunosInscritos.filter(a => a.id !== id);
  }

  // ✅ Método para voltar à lista
  voltar(): void {
    this.router.navigate(['/secretaria/projetos']);
  }

  // ✅ Limpar formulário
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

  // ✅ Getter para título da página
  get tituloPagina(): string {
    return this.modoEdicao ? 'Editar Projeto' : 'Cadastrar Projeto';
  }

  // ✅ Getter para texto do botão
  get textoBotao(): string {
    return this.modoEdicao ? 'Atualizar Projeto' : 'Cadastrar Projeto';
  }
}
