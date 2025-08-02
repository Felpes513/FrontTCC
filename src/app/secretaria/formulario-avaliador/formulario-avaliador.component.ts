import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUserTie, faSave } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-formulario-avaliador',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './formulario-avaliador.component.html',
  styleUrls: ['./formulario-avaliador.component.css']
})
export class FormularioAvaliadorComponent implements OnInit {
  avaliador = {
    id: null,
    nome: '',
    especialidade: '',
    subespecialidade: '',
    lattes_link: ''
  };

  edicao: boolean = false;

  constructor(private http: HttpClient, private router: Router, private iconLib: FaIconLibrary) {
    iconLib.addIcons(faUserTie, faSave);
  }

  ngOnInit(): void {
    const estado = history.state;
    if (estado && estado.avaliador) {
      this.avaliador = estado.avaliador;
      this.edicao = true;
    }
  }

  salvarAvaliador() {
    if (this.edicao) {
      this.http.put(`http://localhost:8000/avaliadores-externos/${this.avaliador.id}`, this.avaliador)
        .subscribe(() => {
          alert('Avaliador atualizado com sucesso!');
          this.router.navigate(['/secretaria/listagem-avaliadores']);
        });
    } else {
      this.http.post('http://localhost:8000/avaliadores-externos', this.avaliador)
        .subscribe(() => {
          alert('Avaliador cadastrado com sucesso!');
          this.router.navigate(['/secretaria/listagem-avaliadores']);
        });
    }
  }
}
