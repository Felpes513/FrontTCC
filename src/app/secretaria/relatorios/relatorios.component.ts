// src/app/secretaria/relatorios/relatorios.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RelatorioService } from '@services/relatorio.service';

@Component({
  standalone: true,
  selector: 'app-relatorios',
  imports: [CommonModule],
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.css']
})
export class RelatoriosComponent {
  private relatorioService = inject(RelatorioService);
  baixando = false;

  baixarAlunosXlsx() {
    this.baixando = true;
    this.relatorioService.baixarRelatorioAlunos().subscribe({
      next: (res) => {
        const blob = res.body as Blob;
        // tenta extrair filename do header Content-Disposition
        const cd = res.headers.get('Content-Disposition') || '';
        const m = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
        const filename = decodeURIComponent(m?.[1] || m?.[2] || 'relatorio_alunos.xlsx');

        // baixa o arquivo
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
}
