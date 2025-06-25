import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-envio-de-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './envio-de-email.component.html'
})
export class EnvioDeEmailComponent implements OnInit {
  projetos: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarProjetos();
  }

carregarProjetos() {
  this.http.get<any[]>('http://localhost:5000/api/projetos')
    .subscribe({
      next: data => {
        console.log('Projetos carregados:', data);
        this.projetos = data;
      },
      error: err => console.error('Erro ao carregar projetos:', err)
    });
  }

  enviarCertificados(projetoId: number) {
    this.http.post('http://localhost:5000/api/enviar-certificado', {
      projeto_id: projetoId
    }).subscribe({
      next: (res: any) => alert(`✅ ${res.mensagem}`),
      error: (err) => alert(`❌ Erro: ${err.error.erro || 'Erro ao enviar certificados.'}`)
    });
  }
}
