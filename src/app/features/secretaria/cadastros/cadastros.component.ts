import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegisterService } from '@services/cadastro.service';
import { forkJoin } from 'rxjs';

type Aba = 'APROVACoes' | 'INADIMPLENTES';
type Tipo = 'ALUNOS' | 'ORIENTADORES';

@Component({
  standalone: true,
  selector: 'app-cadastros',
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastros.component.html',
  styleUrls: ['./cadastros.component.css'],
})
export class CadastrosComponent implements OnInit {
  // abas e sub-abas
  aba: Aba = 'APROVACoes';
  tipo: Tipo = 'ALUNOS';

  // estados
  filtro = '';
  carregando = false;
  erro: string | null = null;

  // dados
  alunos: any[] = [];
  orientadores: any[] = [];
  alunosInad: any[] = [];
  orientadoresInad: any[] = [];

  constructor(private api: RegisterService) {}

  ngOnInit() {
    this.load();
  }

  setAba(a: Aba) {
    this.aba = a;
    this.load();
  }
  setTipo(t: Tipo) {
    this.tipo = t;
    this.load();
  }

  private load() {
    this.carregando = true;
    this.erro = null;

    if (this.aba === 'APROVACoes') {
      if (this.tipo === 'ALUNOS') {
        this.api.listarAlunos().subscribe({
          next: (rows: any[]) => {
            this.alunos = rows || [];
            this.carregando = false;
          },
          error: (e: any) => {
            this.erro = e?.message || 'Falha ao listar alunos';
            this.carregando = false;
          },
        });
      } else {
        this.api.listarOrientadores().subscribe({
          next: (rows: any[]) => {
            this.orientadores = rows || [];
            this.carregando = false;
          },
          error: (e: any) => {
            this.erro = e?.message || 'Falha ao listar orientadores';
            this.carregando = false;
          },
        });
      }
    } else {
      // INADIMPLENTES (usar forkJoin ao invés de toPromise)
      forkJoin({
        alunos: this.api.listarAlunosInadimplentes(),
        orientadores: this.api.listarOrientadoresInadimplentes(),
      }).subscribe({
        next: ({ alunos, orientadores }) => {
          this.alunosInad = alunos || [];
          this.orientadoresInad = orientadores || [];
          this.carregando = false;
        },
        error: () => {
          this.erro = 'Falha ao listar inadimplentes';
          this.carregando = false;
        },
      });
    }
  }

  match(term: string, ...vals: (string | number | undefined | null)[]) {
    const f = (term || '').toString().toLowerCase().trim();
    return vals.some((v) => (v ?? '').toString().toLowerCase().includes(f));
    }

  aprovar(id: number) {
    const call =
      this.tipo === 'ALUNOS'
        ? this.api.aprovarAluno(id)
        : this.api.aprovarOrientador(id);
    call.subscribe({
      next: () => this.load(),
      error: () => alert('Erro ao aprovar'),
    });
  }

  reprovar(id: number) {
    if (!confirm('Confirmar reprovação? O usuário ficará inadimplente por 2 anos.')) return;
    const call =
      this.tipo === 'ALUNOS'
        ? this.api.reprovarAluno(id)
        : this.api.reprovarOrientador(id);
    call.subscribe({
      next: () => this.load(),
      error: () => alert('Erro ao reprovar'),
    });
  }
}
