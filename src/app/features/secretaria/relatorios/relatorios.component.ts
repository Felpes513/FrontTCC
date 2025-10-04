import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  RelatorioService,
  RelatorioMensalSecretaria,
  PendenciaSecretaria
} from '@services/relatorio.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-relatorios',
  imports: [CommonModule, FormsModule],
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.css']
})
export class RelatoriosComponent implements OnInit {
  private relatorioService = inject(RelatorioService);

  // XLSX
  baixando = false;

  // Mês selecionado (YYYY-MM)
  mes = this.toYYYYMM(new Date());

  // Mensal – secretaria
  recebidos: RelatorioMensalSecretaria[] = [];
  pendentes: PendenciaSecretaria[] = [];

  carregandoMensal = false;
  erroMensal: string | null = null;

  ngOnInit(): void {
    this.carregarMensal();
  }

  toYYYYMM(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  // ============ Ações ============
  atualizarMes(): void {
    this.carregarMensal();
  }

  carregarMensal(): void {
    this.carregandoMensal = true;
    this.erroMensal = null;

    forkJoin({
      recebidos: this.relatorioService.listarRecebidosSecretaria(this.mes).pipe(
        catchError((e) => {
          console.warn('Recebidos (secretaria) indisponível:', e);
          return of<RelatorioMensalSecretaria[]>([]);
        })
      ),
      pendentes: this.relatorioService.listarPendentesSecretaria(this.mes).pipe(
        catchError((e) => {
          console.warn('Pendentes (secretaria) indisponível:', e);
          return of<PendenciaSecretaria[]>([]);
        })
      ),
    }).subscribe({
      next: ({ recebidos, pendentes }) => {
        this.recebidos = recebidos ?? [];
        this.pendentes = pendentes ?? [];
        this.carregandoMensal = false;

        if (!recebidos.length && !pendentes.length) {
          this.erroMensal =
            'Nenhum dado retornado. Se os endpoints da Secretaria ainda não existem, crie-os em /relatorios-mensais e /relatorios-mensais/pendentes.';
        }
      },
      error: (err) => {
        this.erroMensal = 'Falha ao carregar relatórios do mês.';
        this.carregandoMensal = false;
        console.error(err);
      }
    });
  }

  baixarAlunosXlsx() {
    this.baixando = true;
    this.relatorioService.baixarRelatorioAlunos().subscribe({
      next: (res) => {
        const blob = res.body as Blob;
        const cd = res.headers.get('Content-Disposition') || '';
        const m = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
        const filename = decodeURIComponent(m?.[1] || m?.[2] || 'relatorio_alunos.xlsx');
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        this.baixando = false;
      },
      error: (err) => {
        console.error('Erro ao baixar XLSX:', err);
        alert('Não foi possível gerar o relatório de alunos.');
        this.baixando = false;
      }
    });
  }

  // Helpers de exibição
  dataBr(iso?: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  }
}
