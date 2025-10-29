import { BolsaService } from './../../../services/bolsa.service';
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { ProjetoService } from '@services/projeto.service';
import { InscricoesService } from '@services/inscricoes.service';

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

  private _inscricoes: any[] = [];
  alunosSecretaria: any[] = [];

  // ORIENTADOR
  aprovadas: any[] = [];
  pendentesOuReprovadas: any[] = [];
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
          next: (aprovados: any[]) => {
            this.aprovadas = aprovados ?? [];
            this.pendentesOuReprovadas = [];

            // ✅ pré-seleciona tudo que já está vinculado (MANTER)
            this.selecionados = new Set<number>(
              this.aprovadas.map((a) => this.alunoId(a))
            );

            // ⛔ LOCK DESATIVADO:
            // this.carregarLock();
            // if (this.limite && this.aprovadas.length >= this.limite) {
            //   this.bloqueado = true;
            //   if (!this.bloqueadoEm) this.bloqueadoEm = new Date().toISOString();
            // }

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
    forkJoin({
      inscricoes: this.projetoService.listarInscricoesPorProjeto(
        this.projetoId
      ),
    }).subscribe({
      next: ({ inscricoes }: any) => {
        this._inscricoes = Array.isArray(inscricoes) ? inscricoes : [];
        this.alunosSecretaria = this._inscricoes.map((i) => ({
          nome: i?.aluno?.nome || i?.nome_aluno || i?.nome || '—',
          matricula: i?.aluno?.matricula || i?.matricula || '—',
          email: i?.aluno?.email || i?.email || '—',
          status: i?.status || i?.situacao || 'PENDENTE',
          documentoNotasUrl: i?.documentoNotasUrl,
        }));
        this.loadingFlag = false;
      },
      error: () => {
        this.loadingFlag = false;
        this.alunosSecretaria = [];
      },
    });
  }

  // ===== API p/ template =====
  loading() { return this.loadingFlag; }
  lista() { return this.alunosSecretaria; }
  total() {
    return this.modo === 'SECRETARIA'
      ? this.alunosSecretaria.length
      : this.aprovadas.length + this.pendentesOuReprovadas.length;
  }

  // ===== util ORIENTADOR =====
  alunoId(i: any): number {
    return (i?.id_aluno ?? i?.aluno_id ?? i?.idAluno ?? i?.aluno?.id ?? i?.id ?? 0);
  }
  alunoNome(i: any): string {
    return (
      i?.aluno?.nome ||
      i?.nome_completo ||
      i?.nome_aluno ||
      i?.nome ||
      `Aluno #${this.alunoId(i)}`
    );
  }

  disabledCheckbox(i: any): boolean {
    // ⛔ LOCK DESATIVADO:
    // if (this.bloqueado) return true;
    const id = this.alunoId(i);
    if (this.selecionados.has(id)) return false;
    return this.selecionados.size >= this.limite;
  }

  toggleSelecionado(i: any, checked: boolean) {
    // ⛔ LOCK DESATIVADO:
    // if (this.bloqueado) return;
    const id = this.alunoId(i);
    if (!id) return;
    if (checked) {
      if (this.selecionados.size >= this.limite) return;
      this.selecionados.add(id);
    } else {
      this.selecionados.delete(id);
    }
  }

  salvarSelecao() {
    // ⛔ LOCK DESATIVADO:
    // if (this.bloqueado) return;
    this.sucessoSelecao = '';
    this.erroSalvarSelecao = '';
    this.salvandoSelecao = true;

    const ids = Array.from(this.selecionados);

    this.projetoService.updateAlunosProjeto(this.projetoId, ids).subscribe({
      next: () => {
        this.salvandoSelecao = false;
        this.sucessoSelecao = 'Alunos atualizados com sucesso!';

        // mantém estado local
        this.selecionados = new Set<number>(ids);

        // ⛔ LOCK DESATIVADO:
        // this.bloqueadoEm = new Date().toISOString();
        // if (this.limite && this.selecionados.size >= this.limite) {
        //   this.salvarLock();
        // }

        // recarrega
        this.carregar();
      },
      error: (e) => {
        this.salvandoSelecao = false;
        this.erroSalvarSelecao = e?.message || 'Falha ao salvar seleção.';
      },
    });
  }

  toggleBolsa(i: any, checked: boolean) {
    if (!this.bloqueado) return;
    const id = this.alunoId(i);
    if (!id) return;

    if (checked) this.bolsaMarcada.add(id);
    else this.bolsaMarcada.delete(id);

    this.bolsaService.definirBolsa(this.projetoId, id, checked).subscribe({
      next: () => {},
      error: (e) => {
        if (checked) this.bolsaMarcada.delete(id);
        else this.bolsaMarcada.add(id);
        console.error(e);
      },
    });
  }

  temBolsa(i: any) {
    const id = this.alunoId(i);
    return this.bolsaMarcada.has(id);
  }
}
