import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjetoService } from '../projeto.service';

@Component({
  selector: 'app-formulario-projeto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-projeto.component.html',
  styleUrls: ['./formulario-projeto.component.css']
})
export class FormularioProjetoComponent implements OnInit {
  projeto = {
    nomeProjeto: '',
    campus: '',
    orientadorId: '',
    alunos: ['']
  };

  edicao = false;
  idProjeto!: number;

  orientadores = [
    { id: '1', nome: 'Profa. Magda ' },
    { id: '2', nome: 'Prof. Bognar' },
    { id: '3', nome: 'Profa. Camininha' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private projetoService: ProjetoService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('ID do projeto:', id);
    if (id) {
      this.projetoService.getProjetoPorId(+id).subscribe({
        next: (projeto) => {
          this.projeto = {
            nomeProjeto: projeto.nomeProjeto,
            campus: projeto.campus,
            orientadorId: projeto.orientador?.id,
            alunos: projeto.alunos.map((a: any) => a.nome)
          };
          this.edicao = true;
          this.idProjeto = +id;
        },
        error: () => alert('Erro ao carregar projeto para edição')
      });
    }
  }

  salvarProjeto() {
    const payload = {
      nomeProjeto: this.projeto.nomeProjeto,
      campus: this.projeto.campus,
      orientadorId: this.projeto.orientadorId,
      nomesAlunos: this.projeto.alunos.filter(a => a.trim() !== '')
    };

    const acao = this.edicao
      ? this.projetoService.atualizarProjeto(this.idProjeto, payload)
      : this.projetoService.cadastrarProjeto(payload);

    acao.subscribe({
      next: () => {
        alert(this.edicao ? 'Projeto atualizado com sucesso!' : 'Projeto criado!');
        this.router.navigate(['/secretaria/projetos']);
      },
      error: () => alert('Erro ao salvar projeto')
    });
  }

  adicionarCampoAluno() {
    this.projeto.alunos.push('');
  }

  removerCampoAluno(index: number) {
    this.projeto.alunos.splice(index, 1);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
