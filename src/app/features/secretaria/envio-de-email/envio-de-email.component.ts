// envio-certificados.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Adicione esta importação
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';

interface Projeto {
  id: number;
  nome_projeto: string;
  orientador_nome: string;
}

interface ApiResponse {
  mensagem?: string;
  erro?: string;
  certificados_enviados?: number;
  total_alunos?: number;
  erros?: string[];
}

@Component({
  selector: 'envio-de-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './envio-de-email.component.html',
  styleUrls: ['./envio-de-email.component.css']
})
export class EnvioDeEmailComponent implements OnInit {
  projetos: Projeto[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;
  private readonly apiUrl = environment.emailApiBaseUrl;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarProjetos();
  }

  // Método para otimizar o trackBy do *ngFor
  trackByProjetoId(index: number, projeto: Projeto): number {
    return projeto.id;
  }

  carregarProjetos(): void {
    this.loading = true;
    this.error = null;

    this.http.get<Projeto[]>(`${this.apiUrl}/projetos`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Erro ao carregar projetos:', error);
          this.error = 'Erro ao carregar projetos. Verifique se o servidor está rodando.';
          return of([]);
        })
      )
      .subscribe({
        next: (data) => {
          this.projetos = data;
          this.loading = false;
          if (this.projetos.length === 0) {
            this.error = 'Nenhum projeto encontrado.';
          }
        },
        error: (error) => {
          this.loading = false;
          this.error = 'Erro inesperado ao carregar projetos.';
          console.error('Erro:', error);
        }
      });
  }

  enviarCertificados(projetoId: number, nomeProjeto: string): void {
    if (confirm(`Deseja enviar certificados para todos os alunos do projeto "${nomeProjeto}"?`)) {
      this.loading = true;
      this.error = null;
      this.success = null;

      const payload = { projeto_id: projetoId };

      this.http.post<ApiResponse>(`${this.apiUrl}/enviar-certificado`, payload)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Erro ao enviar certificados:', error);
            let errorMessage = 'Erro ao enviar certificados.';

            if (error.error && error.error.erro) {
              errorMessage = error.error.erro;
            } else if (error.status === 0) {
              errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.';
            }

            this.error = errorMessage;
            return of({ erro: errorMessage } as ApiResponse);
          })
        )
        .subscribe({
          next: (response) => {
            this.loading = false;

            if (response.erro) {
              this.error = response.erro;
            } else if (response.mensagem) {
              this.success = response.mensagem;

              if (response.erros && response.erros.length > 0) {
                this.success += ` Alguns erros ocorreram: ${response.erros.join(', ')}`;
              }

              setTimeout(() => {
                this.success = null;
              }, 5000);
            }
          },
          error: (error) => {
            this.loading = false;
            this.error = 'Erro inesperado ao enviar certificados.';
            console.error('Erro:', error);
          }
        });
    }
  }

  limparMensagens(): void {
    this.error = null;
    this.success = null;
  }
}
