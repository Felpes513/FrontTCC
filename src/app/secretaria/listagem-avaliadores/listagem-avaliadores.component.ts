import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit, faTrash, faUsers, faPlus } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-listagem-avaliadores',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterModule], // 👈 ADICIONE AQUI
  templateUrl: './listagem-avaliadores.component.html',
  styleUrls: ['./listagem-avaliadores.component.css']
})
export class ListagemAvaliadoresComponent implements OnInit {
  avaliadores: any[] = [];

  constructor(private http: HttpClient, private router: Router, private iconLib: FaIconLibrary) {
    iconLib.addIcons(faEdit, faTrash, faUsers, faPlus);
  }
  ngOnInit() {
    this.http.get<any[]>('http://localhost:8000/avaliadores-externos')
      .subscribe(data => this.avaliadores = data);
  }

  editar(avaliador: any) {
    this.router.navigate(['/secretaria/formulario-avaliador'], { state: { avaliador } });
  }

  excluir(id: number) {
    if (confirm('Deseja excluir este avaliador?')) {
      this.http.delete(`http://localhost:8000/avaliadores-externos/${id}`)
        .subscribe(() => {
          this.avaliadores = this.avaliadores.filter(a => a.id !== id);
        });
    }
  }
}
