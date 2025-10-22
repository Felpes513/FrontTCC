import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjetoService } from '@services/projeto.service';

@Component({
  standalone: true,
  selector: 'app-formulario-avaliacao-externa',
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-avaliacao.component.html',
  styleUrls: ['./formulario-avaliacao.component.css']
})
export class FormularioAvaliacaoExternaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projService = inject(ProjetoService);

  token = '';
  carregando = true;
  erro: string | null = null;

  // exibidos na tela
  projetoTitulo = '';
  pdfUrl = '';

  observacoes = '';
  nota: number | null = null;
  enviado = false;

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) {
      this.erro = 'Link inválido.';
      this.carregando = false;
      return;
    }
    this.projService.obterInfoPorToken(this.token).subscribe({
      next: info => {
        this.projetoTitulo = info.projetoTitulo;
        this.pdfUrl = info.pdfUrl;
        this.carregando = false;
      },
      error: e => {
        this.erro = e?.error?.detail || 'Não foi possível abrir o formulário.';
        this.carregando = false;
      }
    });
  }

  abrirPdf() {
    if (this.pdfUrl) window.open(this.pdfUrl, '_blank');
  }

  podeEnviar(): boolean {
    return !this.carregando && !this.enviado && this.nota !== null && this.nota >= 0 && this.nota <= 10;
  }

  enviar() {
    if (!this.podeEnviar()) return;
    this.carregando = true;
    this.projService.salvarAvaliacaoPorToken(this.token, {
      observacoes: this.observacoes?.trim() || '',
      nota: this.nota as number
    }).subscribe({
      next: () => {
        this.enviado = true;
        this.carregando = false;
      },
      error: e => {
        this.erro = e?.error?.detail || 'Falha ao enviar avaliação.';
        this.carregando = false;
      }
    });
  }
}
