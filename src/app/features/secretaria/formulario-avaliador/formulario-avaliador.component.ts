import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AvaliadorExterno } from '@interfaces/avaliador_externo';
import { ProjetoService } from '@services/projeto.service';

@Component({
  selector: 'app-formulario-avaliador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-avaliador.component.html',
  styleUrls: ['./formulario-avaliador.component.css'],
})
export class FormularioAvaliadorComponent implements OnInit {
  avaliador = {
    id: null as number | null,
    nome: '',
    email: '',
    especialidade: '',
    subespecialidade: '',
    link_lattes: '',
  };

  edicao = false;

  constructor(
    private router: Router,
    private projetoService: ProjetoService
  ) {}

  ngOnInit(): void {
    const estado = history.state;
    if (estado?.avaliador) {
      const a = estado.avaliador;
      this.avaliador = {
        id: a.id ?? null,
        nome: a.nome ?? '',
        email: a.email ?? '',
        especialidade: a.especialidade ?? '',
        subespecialidade: a.subespecialidade ?? '',
        link_lattes: a.link_lattes ?? a.lattes_link ?? '',
      };
      this.edicao = true;
    }
  }

  salvarAvaliador() {
    if (!this.avaliador.nome.trim() || !this.avaliador.email.trim()) {
      alert('Preencha pelo menos Nome e E-mail.');
      return;
    }

    const payload: AvaliadorExterno = {
      nome: this.avaliador.nome.trim(),
      email: this.avaliador.email.trim(),
      especialidade: this.avaliador.especialidade.trim(),
      subespecialidade: this.avaliador.subespecialidade.trim(),
      link_lattes: this.avaliador.link_lattes.trim(),
    };

    const goToList = () =>
      this.router.navigate(['/secretaria/avaliadores'], {
        replaceUrl: true,
        state: { reload: true },
      });

    if (this.edicao && this.avaliador.id) {
      this.projetoService.atualizarAvaliador(this.avaliador.id, payload).subscribe({
        next: () => { alert('Avaliador atualizado com sucesso!'); goToList(); },
        error: (err) => alert(`Erro: ${err.message || 'Falha ao atualizar'}`),
      });
    } else {
      this.projetoService.criarAvaliador(payload).subscribe({
        next: () => { alert('Avaliador cadastrado com sucesso!'); goToList(); },
        error: (err) => alert(`Erro: ${err.message || 'Falha ao cadastrar'}`),
      });
    }
  }
}
