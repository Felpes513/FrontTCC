import {
  Component,
  Input,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { InscricoesService, Inscricao } from '../../services/inscricoes.service'; // ajustado

@Component({
  selector: 'app-listagem-alunos',
  standalone: true,
  templateUrl: './listagem-alunos.component.html',
  styleUrls: ['./listagem-alunos.component.css'],
  imports: [CommonModule],
})
export class ListagemAlunosComponent implements OnInit {
  @Input({ required: true }) projetoId!: number;

  private svc = inject(InscricoesService);

  loading = signal(true);
  lista = signal<Inscricao[]>([]); // ajustado
  total = computed(() => this.lista().length);

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    if (!this.projetoId) return;
    this.loading.set(true);
    this.svc.listarPorProjeto(this.projetoId).subscribe({
      next: (data) => {
        this.lista.set(data ?? []); // ✅ data já é Inscricao[]
        this.loading.set(false);
      },
      error: () => {
        this.lista.set([]);
        this.loading.set(false);
      },
    });
  }
}
