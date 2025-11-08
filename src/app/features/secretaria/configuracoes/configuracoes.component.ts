import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { ConfigService } from '@services/config.service';
import { BolsaService, BolsaRow } from '@services/bolsa.service';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTabsModule],
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.css'],
})
export class ConfiguracoesComponent implements OnInit {
  // Campus
  campus: any[] = [];
  novoCampus = '';

  // Cursos
  cursos: any[] = [];
  novoCurso = '';

  // ===== Tipos de Bolsa (CRUD) =====
  tiposBolsa: Array<{ id_bolsa: number; nome: string }> = [];
  novaBolsa = '';

  // ===== Atribuição (alunos) =====
  bolsas: BolsaRow[] = [];
  filtroBolsa = '';
  carregandoBolsas = false;
  erroBolsas: string | null = null;

  constructor(private config: ConfigService, private bolsasApi: BolsaService) {}

  ngOnInit(): void {
    this.carregarCampus();
    this.carregarCursos();
    this.carregarTiposBolsa();
    this.carregarBolsas();
  }

  // ---- Campus ----
  carregarCampus() {
    this.config.listarCampus().subscribe((res) => (this.campus = res.campus));
  }
  cadastrarCampus() {
    if (!this.novoCampus.trim()) return;
    this.config.criarCampus({ campus: this.novoCampus }).subscribe(() => {
      this.novoCampus = '';
      this.carregarCampus();
    });
  }
  excluirCampus(id: number) {
    if (!confirm('Confirma excluir este campus?')) return;
    this.config.excluirCampus(id).subscribe({
      next: () => this.carregarCampus(),
      error: () => alert('Falha ao excluir campus'),
    });
  }

  // ---- Cursos ----
  carregarCursos() {
    this.config.listarCursos().subscribe((res) => (this.cursos = res.cursos));
  }
  cadastrarCurso() {
    if (!this.novoCurso.trim()) return;
    this.config.criarCurso({ nome: this.novoCurso }).subscribe(() => {
      this.novoCurso = '';
      this.carregarCursos();
    });
  }
  excluirCurso(id: number) {
    if (!confirm('Confirma excluir este curso?')) return;
    this.config.excluirCurso(id).subscribe({
      next: () => this.carregarCursos(),
      error: () => alert('Falha ao excluir curso'),
    });
  }

  // ---- Tipos de Bolsa (CRUD) ----
  carregarTiposBolsa() {
    this.config.listarTiposBolsa().subscribe({
      next: (res: any) => {
        const arr = Array.isArray(res) ? res : res?.bolsas ?? [];
        this.tiposBolsa = arr.map((x: any) => ({
          id_bolsa: x.id_bolsa ?? x.id ?? x.idBolsa,
          nome: x.nome ?? x.bolsa ?? x.descricao,
        }));
      },
      error: () => (this.tiposBolsa = []),
    });
  }

  cadastrarTipoBolsa() {
    const nome = (this.novaBolsa || '').trim();
    if (!nome) return;
    this.config.criarTipoBolsa({ nome }).subscribe({
      next: () => {
        this.novaBolsa = '';
        this.carregarTiposBolsa();
      },
      error: (e: any) => alert(e?.error?.detail || 'Falha ao criar bolsa'),
    });
  }

  excluirTipoBolsa(id_bolsa: number) {
    if (!confirm('Confirma excluir esta bolsa?')) return;
    this.config.excluirTipoBolsa(id_bolsa).subscribe({
      next: () => this.carregarTiposBolsa(),
      error: () => alert('Falha ao excluir bolsa'),
    });
  }

  // ---- Atribuição (alunos) ----
  carregarBolsas() {
    this.carregandoBolsas = true;
    this.erroBolsas = null;
    this.bolsasApi.listar().subscribe({
      next: (rows) => {
        this.bolsas = (rows ?? []).map((r) => ({
          ...r,
          nome_completo: this.properCase(r.nome_completo),
        }));
        this.carregandoBolsas = false;
      },
      error: () => {
        this.erroBolsas = 'Falha ao carregar bolsas';
        this.carregandoBolsas = false;
      },
    });
  }

  toggleBolsa(row: BolsaRow) {
    const novo = !row.possui_bolsa;
    const anterior = row.possui_bolsa;
    row.possui_bolsa = novo; // otimista
    this.bolsasApi.setStatus(row.id_aluno, novo).subscribe({
      error: () => {
        row.possui_bolsa = anterior; // rollback
        alert('Não foi possível atualizar a bolsa deste aluno.');
      },
    });
  }

  matchBolsa(term: string, ...vals: (string | number | undefined | null)[]) {
    const norm = (s: any) =>
      (s ?? '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
    const f = norm(term);
    if (!f) return true;
    return vals.some((v) => norm(v).includes(f));
  }

  private properCase(value: string): string {
    const lower = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'di']);
    return (value || '')
      .toLowerCase()
      .split(/\s+/)
      .map((w, i) =>
        i > 0 && lower.has(w) ? w : w[0]?.toUpperCase() + w.slice(1)
      )
      .join(' ');
  }
}
