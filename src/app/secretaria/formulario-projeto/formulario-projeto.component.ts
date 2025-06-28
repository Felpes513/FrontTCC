import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjetoService, ProjetoCadastro, Aluno, ProjetoDetalhado } from '../projeto.service';

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
    orientadorNome: '',
    orientadorEmail: '',
    alunos: [{ nome: '', email: '' }] as Aluno[]
  };

  edicao = false;
  idProjeto!: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private projetoService: ProjetoService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projetoService.getProjetoPorId(+id).subscribe({
        next: (projeto: ProjetoDetalhado) => {
          this.projeto = {
            nomeProjeto: projeto.nomeProjeto,
            campus: projeto.campus,
            orientadorNome: projeto.orientador?.nome || '',
            orientadorEmail: projeto.orientador?.email || '',
            alunos: projeto.alunos?.length > 0
              ? projeto.alunos.map((a) => ({ nome: a.nome, email: a.email }))
              : [{ nome: '', email: '' }]
          };
          this.edicao = true;
          this.idProjeto = +id;
        },
        error: () => alert('Erro ao carregar projeto para edição')
      });
    }
  }

  salvarProjeto() {
    if (!this.projeto.nomeProjeto.trim() || !this.projeto.orientadorNome.trim()) {
      alert('Nome do projeto e do orientador são obrigatórios.');
      return;
    }

    const alunosValidos = this.projeto.alunos.filter(aluno => aluno.nome.trim() && aluno.email.trim());

    if (alunosValidos.length === 0) {
      alert('Pelo menos um aluno válido deve ser informado.');
      return;
    }

    const payload: ProjetoCadastro = {
      nomeProjeto: this.projeto.nomeProjeto,
      campus: this.projeto.campus,
      orientador: {
        nome: this.projeto.orientadorNome,
        email: this.projeto.orientadorEmail
      },
      alunos: alunosValidos
    };

    const acao = this.edicao
      ? this.projetoService.atualizarProjeto(this.idProjeto, payload)
      : this.projetoService.cadastrarProjeto(payload);

    acao.subscribe({
      next: () => {
        alert(this.edicao ? 'Projeto atualizado com sucesso!' : 'Projeto criado!');
        this.router.navigate(['/secretaria/projetos']);
      },
      error: (error) => {
        console.error('Erro ao salvar projeto:', error);
        alert('Erro ao salvar projeto');
      }
    });
  }

  adicionarCampoAluno() {
    this.projeto.alunos.push({ nome: '', email: '' });
  }

  removerCampoAluno(index: number) {
    if (this.projeto.alunos.length > 1) {
      this.projeto.alunos.splice(index, 1);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

}
