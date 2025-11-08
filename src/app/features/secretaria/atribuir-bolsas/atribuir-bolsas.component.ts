import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProjetoService } from '@services/projeto.service';
import { BolsaService, BolsaRow } from '@services/bolsa.service';

type AlunoProjeto = {
  id: number;
  nome: string;
  email: string;
  possuiTrabalhoRemunerado: boolean;
};

type AlunoBolsas = AlunoProjeto & {
  possui_bolsa?: boolean;
  __loading?: boolean; // estado de UI por linha
};

@Component({
  selector: 'app-atribuir-bolsas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './atribuir-bolsas.component.html',
  styleUrls: ['./atribuir-bolsas.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AtribuirBolsasComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private projetoService = inject(ProjetoService);
  private bolsaService = inject(BolsaService);

  projetoId = 0;
  carregando = true;
  erro: string | null = null;

  alunos: AlunoBolsas[] = [];

  ngOnInit(): void {
    this.projetoId = Number(this.route.snapshot.params['id']);
    this.load();
  }

  trackByAlunoId = (_: number, a: AlunoBolsas) => a.id;

  private load(): void {
    this.carregando = true;
    this.erro = null;

    this.projetoService.listarAlunosCadastrados(this.projetoId).subscribe({
      next: (alunosProj: AlunoProjeto[]) => {
        this.bolsaService.listar().subscribe({
          next: (bolsas: BolsaRow[]) => {
            const map = new Map(
              bolsas.map((b) => [b.id_aluno, b.possui_bolsa])
            );
            this.alunos = alunosProj.map((a) => ({
              ...a,
              possui_bolsa: !!map.get(a.id),
              __loading: false,
            }));
            this.carregando = false;
          },
          error: () => {
            // Se falhar o GET /bolsas, exibimos ao menos os alunos.
            this.alunos = alunosProj.map((a) => ({ ...a, __loading: false }));
            this.carregando = false;
          },
        });
      },
      error: () => {
        this.erro = 'Falha ao carregar alunos do projeto';
        this.carregando = false;
      },
    });
  }

  toggleBolsa(a: AlunoBolsas): void {
    const novoValor = !a.possui_bolsa;
    const anterior = !!a.possui_bolsa;

    a.possui_bolsa = novoValor; // otimista
    a.__loading = true;

    this.bolsaService.setStatus(a.id, novoValor).subscribe({
      next: () => {
        a.__loading = false;
      },
      error: () => {
        // rollback se falhar
        a.possui_bolsa = anterior;
        a.__loading = false;
        alert('Erro ao atualizar bolsa do aluno.');
      },
    });
  }
}
