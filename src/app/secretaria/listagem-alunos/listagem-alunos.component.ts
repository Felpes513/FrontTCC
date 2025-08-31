import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { ProjetoService } from '@services/projeto.service';

type Modo = 'SECRETARIA' | 'ORIENTADOR';

@Component({
  selector: 'app-listagem-alunos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listagem-alunos.component.html',
  styleUrls: ['./listagem-alunos.component.css'],
})
export class ListagemAlunosComponent implements OnInit {
  @Input({ required: true }) projetoId!: number;
  @Input() modo: Modo = 'SECRETARIA';

  // dados “crus” vindos da API de inscrições
  private _inscricoes: any[] = [];

  // secretaria usa esta lista direto
  alunosSecretaria: any[] = [];

  // orientador usa estes separadores
  aprovadas: any[] = [];
  pendentesOuReprovadas: any[] = [];
  selecionados = new Set<number>();
  limite = 0;

  loadingFlag = false;
  salvandoSelecao = false;
  sucessoSelecao = '';
  erroSalvarSelecao = '';

  constructor(private projetoService: ProjetoService) {}

  ngOnInit(): void {
    if (!this.projetoId) return;
    this.carregar();
  }

  private carregar() {
    this.loadingFlag = true;

    // Para o orientador precisamos do detalhe do projeto (p/ limite + pré-seleção)
    const reqs =
      this.modo === 'ORIENTADOR'
        ? forkJoin({
            inscricoes: this.projetoService.listarInscricoesPorProjeto(this.projetoId),
            projeto: this.projetoService.getProjetoDetalhado(this.projetoId),
          })
        : forkJoin({
            inscricoes: this.projetoService.listarInscricoesPorProjeto(this.projetoId),
          });

    reqs.subscribe({
      next: (res: any) => {
        this._inscricoes = Array.isArray(res.inscricoes) ? res.inscricoes : [];

        if (this.modo === 'SECRETARIA') {
          // Mantém o shape que seu HTML atual já espera
          this.alunosSecretaria = this._inscricoes.map(i => ({
            nome: i?.aluno?.nome || i?.nome_aluno || i?.nome || '—',
            matricula: i?.aluno?.matricula || i?.matricula || '—',
            email: i?.aluno?.email || i?.email || '—',
            status: i?.status || i?.situacao || 'PENDENTE',
            documentoNotasUrl: i?.documentoNotasUrl,
          }));
        } else {
          // ORIENTADOR: separa aprovados x outros
          this.aprovadas = this._inscricoes.filter(i => this.isAprovada(i));
          this.pendentesOuReprovadas = this._inscricoes.filter(i => !this.isAprovada(i));

          // limite + pré-seleção dos já participantes
          this.limite = Number(res?.projeto?.quantidadeMaximaAlunos || 0);
          const jaNoProjetoIds = this.extractIdsFromAlunos(res?.projeto?.alunos || res?.projeto?.nomesAlunos || []);
          this.selecionados = new Set<number>(jaNoProjetoIds);
        }

        this.loadingFlag = false;
      },
      error: () => {
        this.loadingFlag = false;
        this.alunosSecretaria = [];
        this.aprovadas = [];
        this.pendentesOuReprovadas = [];
      },
    });
  }

  // ==== API compatível com o HTML original (SECRETARIA) ====
  loading() { return this.loadingFlag; }
  lista() { return this.alunosSecretaria; }
  total() { return this.modo === 'SECRETARIA'
    ? this.alunosSecretaria.length
    : (this.aprovadas.length + this.pendentesOuReprovadas.length);
  }

  // ==== Utilitários do ORIENTADOR ====
  alunoId(i: any): number {
    return i?.id_aluno ?? i?.aluno_id ?? i?.idAluno ?? i?.aluno?.id ?? i?.id ?? 0;
  }
  alunoNome(i: any): string {
    return i?.aluno?.nome || i?.nome_aluno || i?.nome || i?.aluno_nome || `Aluno #${this.alunoId(i)}`;
  }
  isAprovada(i: any): boolean {
    const s = String(i?.status || i?.situacao || '').toUpperCase();
    return s === 'APROVADO' || s === 'APROVADA' || i?.aprovado === true;
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
  salvarSelecao() {
    this.sucessoSelecao = '';
    this.erroSalvarSelecao = '';
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
      },
    });
  }

  private extractIdsFromAlunos(arr: any[]): number[] {
    if (!Array.isArray(arr)) return [];
    return arr.map((a: any) => a?.id ?? a?.id_aluno ?? a).filter((v: any) => typeof v === 'number');
  }
}
