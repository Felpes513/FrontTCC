import { BolsaService } from '@services/bolsa.service';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProjetoService } from '@services/projeto.service';
import { InscricoesService } from '@services/inscricoes.service';
import { ProjetoInscricaoApi } from '@interfaces/projeto';

type Modo = 'SECRETARIA' | 'ORIENTADOR';

interface AlunoSecretariaView {
  idInscricao: number;
  idAluno: number;
  nome: string;
  matricula: string;
  email: string;
  status: string;
  possuiTrabalhoRemunerado: boolean;
  documentoNotasUrl?: string | null;
}

@Component({
  selector: 'app-listagem-alunos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listagem-alunos.component.html',
  styleUrls: ['./listagem-alunos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListagemAlunosComponent implements OnInit {
  @Input({ required: true }) projetoId!: number;
  @Input() modo: Modo = 'SECRETARIA';

  readonly skeletonRows = [1, 2, 3, 4];

  private _inscricoes: ProjetoInscricaoApi[] = [];
  alunosSecretaria: AlunoSecretariaView[] = [];

  // ORIENTADOR
  aprovadas: ProjetoInscricaoApi[] = [];
  pendentesOuReprovadas: ProjetoInscricaoApi[] = [];
  selecionados = new Set<number>();
  limite = 4; // até 4 no front

  // lock
  bloqueado = false;
  bloqueadoEm?: string;

  // UI
  loadingFlag = false;
  salvandoSelecao = false;
  sucessoSelecao = '';
  erroSalvarSelecao = '';

  bolsaMarcada = new Set<number>();

  constructor(
    private projetoService: ProjetoService,
    private inscricoesService: InscricoesService,
    private bolsaService: BolsaService
  ) {}

  ngOnInit(): void {
    if (!this.projetoId) return;
    this.carregar();
  }

  // ===== helpers de lock (salvos no localStorage) =====
  private lockKey() {
    return `proj-lock:${this.projetoId}`;
  }

  private carregarLock() {
    try {
      const raw = localStorage.getItem(this.lockKey());
      if (!raw) return;
      const v = JSON.parse(raw);
      this.bloqueado = !!v?.lock;
      this.bloqueadoEm = v?.ts || undefined;
    } catch {
      this.bloqueado = localStorage.getItem(this.lockKey()) === '1';
    }
  }

  private salvarLock() {
    const payload = { lock: true, ts: new Date().toISOString() };
    localStorage.setItem(this.lockKey(), JSON.stringify(payload));
    this.bloqueado = true;
    this.bloqueadoEm = payload.ts;
  }

  // ===== carga =====
  private carregar() {
    this.loadingFlag = true;

    if (this.modo === 'ORIENTADOR') {
      this.inscricoesService
        .listarAprovadosDoProjeto(this.projetoId)
        .subscribe({
          next: (aprovados: ProjetoInscricaoApi[]) => {
            this.aprovadas = aprovados ?? [];
            this.pendentesOuReprovadas = [];

            // pré-seleciona o que já está vinculado
            this.selecionados = new Set<number>(
              this.aprovadas.map((a) => this.alunoId(a))
            );

            // this.carregarLock(); // lock desativado
            this.loadingFlag = false;
          },
          error: () => {
            this.loadingFlag = false;
            this.aprovadas = [];
            this.pendentesOuReprovadas = [];
          },
        });
      return;
    }

    // ===== SECRETARIA =====
    this.projetoService
      .listarInscricoesPorProjeto(this.projetoId)
      .subscribe({
        next: (inscricoes: ProjetoInscricaoApi[]) => {
          this._inscricoes = Array.isArray(inscricoes) ? inscricoes : [];
          this.alunosSecretaria = this._inscricoes.map((i) =>
            this.mapAlunoSecretaria(i)
          );
          this.loadingFlag = false;
        },
        error: () => {
          this.loadingFlag = false;
          this.alunosSecretaria = [];
        },
      });
  }

  // ===== API p/ template =====
  loading() {
    return this.loadingFlag;
  }
  lista(): AlunoSecretariaView[] {
    return this.alunosSecretaria;
  }
  total() {
    return this.modo === 'SECRETARIA'
      ? this.alunosSecretaria.length
      : this.aprovadas.length + this.pendentesOuReprovadas.length;
  }

  // ===== util ORIENTADOR =====
  alunoId(i: ProjetoInscricaoApi): number {
    return (
      i?.id_aluno ?? i?.aluno_id ?? i?.idAluno ?? i?.aluno?.id ?? i?.id ?? 0
    );
  }
  alunoNome(i: ProjetoInscricaoApi): string {
    return (
      i?.aluno?.nome ||
      i?.nome_completo ||
      i?.nome_aluno ||
      i?.nome ||
      `Aluno #${this.alunoId(i)}`
    );
  }

  disabledCheckbox(i: ProjetoInscricaoApi): boolean {
    const id = this.alunoId(i);
    if (this.selecionados.has(id)) return false;
    return this.selecionados.size >= this.limite;
  }

  toggleSelecionado(i: ProjetoInscricaoApi, checked: boolean) {
    const id = this.alunoId(i);
    if (!id) return;
    if (checked) {
      if (this.selecionados.size >= this.limite) return;
      this.selecionados.add(id);
    } else {
      this.selecionados.delete(id);
    }
  }

  onSelecionadoChange(event: Event, inscricao: ProjetoInscricaoApi) {
    const target = event.target as HTMLInputElement | null;
    this.toggleSelecionado(inscricao, !!target?.checked);
  }

  salvarSelecao() {
    this.sucessoSelecao = '';
    this.erroSalvarSelecao = '';
    this.salvandoSelecao = true;

    const ids = Array.from(this.selecionados);

    this.projetoService
      .updateAlunosProjeto({
        id_projeto: this.projetoId,
        ids_alunos_aprovados: ids,
      })
      .subscribe({
        next: () => {
          this.salvandoSelecao = false;
          this.sucessoSelecao = 'Alunos atualizados com sucesso!';
          this.selecionados = new Set<number>(ids);
          this.carregar();
        },
        error: (e: unknown) => {
          this.salvandoSelecao = false;
          const message =
            typeof e === 'object' && e && 'message' in e
              ? String((e as { message: unknown }).message)
              : null;
          this.erroSalvarSelecao =
            message || 'Falha ao salvar seleção.';
        },
      });
  }

  toggleBolsa(i: ProjetoInscricaoApi, checked: boolean) {
    if (!this.bloqueado) return;
    const id = this.alunoId(i);
    if (!id) return;

    if (checked) this.bolsaMarcada.add(id);
    else this.bolsaMarcada.delete(id);

    // ✅ usa o método existente no service
    this.bolsaService.setStatus(id, checked).subscribe({
      next: () => {},
      error: (erro: unknown) => {
        if (checked) this.bolsaMarcada.delete(id);
        else this.bolsaMarcada.add(id);
        console.error(erro);
      },
    });
  }

  temBolsa(i: ProjetoInscricaoApi) {
    const id = this.alunoId(i);
    return this.bolsaMarcada.has(id);
  }

  trackByAlunoSecretaria = (_: number, aluno: AlunoSecretariaView) =>
    aluno.idInscricao;

  trackByInscricao = (_: number, inscricao: ProjetoInscricaoApi) =>
    this.alunoId(inscricao);

  trackByIndex = (index: number) => index;

  private mapAlunoSecretaria(
    inscricao: ProjetoInscricaoApi
  ): AlunoSecretariaView {
    const idAluno = this.alunoId(inscricao);
    const idInscricao = inscricao?.id_inscricao ?? 0;

    return {
      idInscricao,
      idAluno,
      nome:
        inscricao?.aluno?.nome ||
        inscricao?.nome_aluno ||
        inscricao?.nome ||
        `Aluno #${idAluno || idInscricao}`,
      matricula:
        inscricao?.aluno?.matricula || inscricao?.matricula || '—',
      email: inscricao?.aluno?.email || inscricao?.email || '—',
      status: inscricao?.status || inscricao?.situacao || 'PENDENTE',
      possuiTrabalhoRemunerado:
        inscricao?.possuiTrabalhoRemunerado ??
        !!inscricao?.possui_trabalho_remunerado,
      documentoNotasUrl: inscricao?.documentoNotasUrl ?? undefined,
    };
  }
}
