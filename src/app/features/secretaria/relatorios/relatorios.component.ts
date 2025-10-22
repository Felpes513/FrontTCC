import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RelatorioService } from '@services/relatorio.service';
import { RelatorioMensal, PendenciaMensal } from '@interfaces/relatorio';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-relatorios',
  imports: [CommonModule, FormsModule],
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.css'],
})
export class RelatoriosComponent implements OnInit {
  private relatorioService = inject(RelatorioService);
  private router = inject(Router);

  baixando = false;
  mes = this.toYYYYMM(new Date());

  recebidos: RelatorioMensal[] = [];
  pendentes: PendenciaMensal[] = [];

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
          return of<RelatorioMensal[]>([]);
        })
      ),
      pendentes: this.relatorioService.listarPendentesSecretaria(this.mes).pipe(
        catchError((e) => {
          console.warn('Pendentes (secretaria) indisponível:', e);
          return of<PendenciaMensal[]>([]);
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
      },
    });
  }

  baixarAlunosXlsx() {
    this.baixando = true;
    this.relatorioService.baixarRelatorioAlunos().subscribe({
      next: (res) => {
        const blob = res.body as Blob;
        const cd = res.headers.get('Content-Disposition') || '';
        const m = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
        const filename = decodeURIComponent(
          m?.[1] || m?.[2] || 'relatorio_alunos.xlsx'
        );
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
      },
    });
  }

  // ✅ usar a propriedade correta (projetoId)
  abrirDetalhe(r: RelatorioMensal) {
    const id = r?.projetoId ?? (r as any)?.id_projeto; // fallback defensivo
    if (!id) return;

    this.router.navigate(['/orientador/relatorios', id], {
      queryParams: { mes: r.referenciaMes, readonly: 1 }, // somente leitura
    });
  }

  dataBr(iso?: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  }
}
