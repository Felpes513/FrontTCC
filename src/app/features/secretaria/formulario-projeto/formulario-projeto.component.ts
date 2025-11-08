import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ProjetoService } from '@services/projeto.service';
import type { ProjetoCadastro } from '@interfaces/projeto';
import type { Orientador } from '@interfaces/orientador';
import type { Aluno } from '@interfaces/aluno';
import type { Campus } from '@interfaces/campus';
import { ListagemAlunosComponent } from '../listagem-alunos/listagem-alunos.component';

type EtapaDocumento = 'IDEIA' | 'PARCIAL' | 'FINAL';
type StatusEnvio = 'ENVIADO' | 'NAO_ENVIADO';
interface DocumentoHistorico {
  etapa: EtapaDocumento;
  status: StatusEnvio;
  dataEnvio?: Date;
  arquivos?: { docx?: { nome: string }; pdf?: { nome: string } };
}

type ProjetoCadastroExt = ProjetoCadastro & {
  nota1?: number | null;
  nota2?: number | null;
  notaFinal?: number | null;
  tipo_bolsa?: string | null;
  cod_projeto?: string;
  ideia_inicial_b64?: string; // <- usado apenas no POST
};

@Component({
  selector: 'app-formulario-projeto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ListagemAlunosComponent],
  templateUrl: './formulario-projeto.component.html',
  styleUrls: ['./formulario-projeto.component.css'],
})
export class FormularioProjetoComponent implements OnInit {
  projeto: ProjetoCadastroExt = {
    titulo_projeto: '',
    resumo: '',
    orientador_nome: '',
    orientador_email: '',
    quantidadeMaximaAlunos: 0,
    id_campus: 0,
    nota1: null,
    nota2: null,
    notaFinal: null,
    tipo_bolsa: null,
    cod_projeto: '',
    ideia_inicial_b64: '',
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

  isOrientadorMode = false;

  // Upload
  @ViewChild('docxInput') docxInput!: ElementRef<HTMLInputElement>;
  @ViewChild('pdfInput') pdfInput!: ElementRef<HTMLInputElement>;
  arquivoDocx?: File;
  arquivoPdf?: File;

  podeAvancar = false;

  historico: DocumentoHistorico[] = [
    { etapa: 'IDEIA', status: 'NAO_ENVIADO' },
    { etapa: 'PARCIAL', status: 'NAO_ENVIADO' },
    { etapa: 'FINAL', status: 'NAO_ENVIADO' },
  ];
  private etapas: EtapaDocumento[] = ['IDEIA', 'PARCIAL', 'FINAL'];

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
        this.router.navigate([
          this.isOrientadorMode
            ? '/orientador/projetos'
            : '/secretaria/projetos',
        ]);
      }
    }
  }

  private carregarProjeto(id: number): void {
    this.carregando = true;
    this.erro = null;

    forkJoin({
      projetos: this.projetoService.listarProjetosRaw(),
      orientadores: this.projetoService.listarOrientadores(),
      campus: this.projetoService.listarCampus(),
    }).subscribe({
      next: ({ projetos, orientadores, campus }) => {
        const p = (projetos || []).find(
          (x: any) => Number(x.id_projeto) === Number(id)
        );
        if (!p) {
          this.erro = 'Projeto não encontrado';
          this.carregando = false;
          return;
        }

        this.projeto.titulo_projeto = p.titulo_projeto || '';
        this.projeto.resumo = p.resumo || '';
        this.projeto.cod_projeto = p.cod_projeto || '';

        const o = (orientadores || []).find(
          (x: any) =>
            (x.nome_completo || '').trim().toLowerCase() ===
            (p.orientador || '').trim().toLowerCase()
        );
        this.orientadorSelecionadoId = o?.id || 0;
        this.projeto.orientador_nome = p.orientador || o?.nome_completo || '';
        this.emailOrientador = o?.email || '';
        this.projeto.orientador_email = this.emailOrientador;

        const c = (campus || []).find(
          (x: any) =>
            (x.campus || '').trim().toLowerCase() ===
            (p.campus || '').trim().toLowerCase()
        );
        this.campusSelecionadoId = c?.id_campus || 0;
        this.projeto.id_campus = this.campusSelecionadoId;

        this.podeAvancar = !!p.has_pdf;

        this.carregando = false;
      },
      error: () => {
        this.erro = 'Falha ao carregar dados do projeto';
        this.carregando = false;
      },
    });
  }

  private carregarOrientadores(): void {
    this.projetoService.listarOrientadoresAprovados().subscribe({
      next: (rows) => {
        this.orientadores = rows ?? [];
        this.orientadoresFiltrados = [...this.orientadores];
      },
      error: () => {
        this.orientadores = this.orientadoresFiltrados = [];
      },
    });
  }

  private carregarCampus(): void {
    this.projetoService.listarCampus().subscribe({
      next: (res: Campus[]) => {
        this.campusList = Array.isArray(res) ? res : [];
        this.campusFiltrados = [...this.campusList];
      },
      error: () => {
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
    const id = Number((event.target as HTMLSelectElement).value);
    if (!id || isNaN(id)) return;

    this.orientadorSelecionadoId = id;
    const orientador = this.orientadores.find((o) => o.id === id);
    if (orientador) {
      this.projeto.orientador_nome = orientador.nome_completo;
      this.projeto.orientador_email = orientador.email || '';
      this.emailOrientador = orientador.email || '';
    }
  }

  selecionarCampus(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    const campus = this.campusList.find((c) => c.id_campus === id);
    if (campus) {
      this.projeto.id_campus = campus.id_campus;
      this.campusSelecionadoId = campus.id_campus;
    }
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Falha ao ler arquivo.'));
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
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
    if (
      !this.projeto.orientador_nome?.trim() ||
      !this.orientadorSelecionadoId
    ) {
      alert('Por favor, selecione um orientador');
      return false;
    }
    if (!this.projeto.id_campus || this.projeto.id_campus <= 0) {
      alert('Por favor, selecione um campus');
      return false;
    }
    return true;
  }

  async salvarProjeto(): Promise<void> {
    if (this.isOrientadorMode) return;
    if (!this.validarFormulario()) return;

    this.carregando = true;
    this.erro = null;

    // No cadastro, DOCX inicial é obrigatório e vai no POST como Base64
    if (!this.modoEdicao) {
      if (!this.arquivoDocx) {
        alert('Selecione o Documento inicial (.docx) para cadastrar.');
        this.carregando = false;
        return;
      }
      try {
        this.projeto.ideia_inicial_b64 = await this.readFileAsBase64(
          this.arquivoDocx
        );
      } catch {
        this.projeto.ideia_inicial_b64 = '';
      }
    }

    const operacao = this.modoEdicao
      ? this.projetoService.atualizarProjeto(this.projetoId, this.projeto)
      : this.projetoService.cadastrarProjetoCompleto(
          {
            ...this.projeto,
            // se o usuário não informar, o service gera
            cod_projeto: (this.projeto.cod_projeto || '').trim(),
            ideia_inicial_b64: this.projeto.ideia_inicial_b64 || '',
          },
          this.orientadorSelecionadoId
        );

    operacao.subscribe({
      next: (resp: any) => {
        if (!this.modoEdicao) {
          const idGerado = resp?.id_projeto ?? resp?.id ?? this.projetoId ?? 0;
          if (idGerado) this.projetoId = Number(idGerado);

          // Atualiza histórico da etapa IDEIA com o DOCX enviado no POST
          if (this.arquivoDocx) {
            this.atualizarHistoricoParaEtapa(
              'IDEIA',
              this.arquivoDocx,
              undefined
            );
          }
          this.modoEdicao = true;
          this.podeAvancar = false; // aguarda PDF
          alert('Projeto cadastrado com sucesso!');
        } else {
          alert('Projeto atualizado com sucesso!');
        }
        this.carregando = false;
      },
      error: (error) => {
        this.erro = error?.message || 'Erro ao salvar projeto';
        this.carregando = false;
      },
    });
  }

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
    if (!this.projetoId)
      return alert('Salve o projeto antes de enviar arquivos.');
    const arquivo = tipo === 'docx' ? this.arquivoDocx : this.arquivoPdf;
    if (!arquivo)
      return alert(`Selecione um arquivo ${tipo.toUpperCase()} primeiro.`);

    const metodo =
      tipo === 'docx'
        ? this.projetoService.uploadDocx(this.projetoId, arquivo)
        : this.projetoService.uploadPdf(this.projetoId, arquivo);

    metodo.subscribe({
      next: () => {
        alert(`${tipo.toUpperCase()} enviado com sucesso!`);
        if (tipo === 'pdf') this.podeAvancar = true;
      },
      error: (err) =>
        alert(`Erro ao enviar ${tipo.toUpperCase()}: ${err.message}`),
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
      error: (err) =>
        alert(`Erro ao baixar ${tipo.toUpperCase()}: ${err.message}`),
    });
  }

  get proximaEtapa(): EtapaDocumento | null {
    for (const e of this.etapas) {
      const h = this.historico.find((x) => x.etapa === e);
      if (!h || h.status === 'NAO_ENVIADO') return e;
    }
    return null;
  }

  get labelBotaoAvancar(): string {
    const proxima = this.proximaEtapa;
    if (!proxima) return 'Todas as etapas concluídas';
    return `Avançar para ${this.tituloEtapa(proxima)}`;
  }

  avancarEtapa(): void {
    const proxima = this.proximaEtapa;
    if (!proxima) return alert('Todas as etapas já foram concluídas.');
    if (!this.projetoId)
      return alert('Salve o projeto antes de avançar etapa.');
    if (!this.arquivoPdf) return alert('Envie o PDF desta etapa para avançar.');

    const ok = confirm(
      `Você deseja avançar para "${this.tituloEtapa(proxima)}"?`
    );
    if (!ok) return;

    this.atualizarHistoricoParaEtapa(
      proxima,
      this.arquivoDocx,
      this.arquivoPdf
    );
    this.limparInputsUpload();
    this.podeAvancar = false;
    alert(`Avançou para "${this.tituloEtapa(proxima)}".`);
  }

  private atualizarHistoricoParaEtapa(
    etapa: EtapaDocumento,
    docx?: File,
    pdf?: File
  ) {
    const idx = this.historico.findIndex((h) => h.etapa === etapa);
    const novo: DocumentoHistorico =
      idx >= 0 ? { ...this.historico[idx] } : { etapa, status: 'NAO_ENVIADO' };
    novo.arquivos = novo.arquivos || {};
    if (docx) novo.arquivos.docx = { nome: docx.name };
    if (pdf) novo.arquivos.pdf = { nome: pdf.name };
    if (novo.arquivos.docx || novo.arquivos.pdf) {
      novo.status = 'ENVIADO';
      novo.dataEnvio = new Date();
    }
    if (idx >= 0) this.historico[idx] = novo;
    else this.historico.push(novo);
  }

  private limparInputsUpload() {
    if (this.docxInput?.nativeElement) this.docxInput.nativeElement.value = '';
    if (this.pdfInput?.nativeElement) this.pdfInput.nativeElement.value = '';
    this.arquivoDocx = undefined;
    this.arquivoPdf = undefined;
  }

  tituloEtapa(e: EtapaDocumento): string {
    return e === 'IDEIA'
      ? 'Submissão do Projeto (Ideia)'
      : e === 'PARCIAL'
      ? 'Monografia Parcial'
      : 'Monografia Final';
  }
  subtituloEtapa(e: EtapaDocumento): string {
    return e === 'IDEIA'
      ? 'Primeiro envio'
      : e === 'PARCIAL'
      ? 'Segundo envio'
      : 'Envio final';
  }
  iconeEtapa(e: EtapaDocumento): string {
    return e === 'IDEIA'
      ? 'fas fa-lightbulb'
      : e === 'PARCIAL'
      ? 'fas fa-list'
      : 'fas fa-graduation-cap';
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
      nota1: null,
      nota2: null,
      notaFinal: null,
      tipo_bolsa: null,
      cod_projeto: '',
      ideia_inicial_b64: '',
    };
    this.orientadorSelecionadoId = 0;
    this.emailOrientador = '';
    this.buscaOrientador = '';
    this.orientadoresFiltrados = [...this.orientadores];
    this.alunosInscritos = [];
    this.campusSelecionadoId = 0;
    this.erro = null;
    this.arquivoDocx = undefined;
    this.arquivoPdf = undefined;
    this.podeAvancar = false;
  }

  get tituloPagina(): string {
    if (this.isOrientadorMode) return 'Selecionar alunos do projeto';
    return this.modoEdicao ? 'Editar Projeto' : 'Cadastrar Projeto';
  }
  get textoBotao(): string {
    if (this.isOrientadorMode) return 'Salvar seleção';
    return this.modoEdicao ? 'Atualizar Projeto' : 'Cadastrar Projeto';
  }
}
