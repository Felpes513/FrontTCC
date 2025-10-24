import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent {
  slides = [
    {
      title: 'Pesquisa e Inovação',
      content:
        'Desenvolva projetos inovadores que contribuem para o avanço da ciência e tecnologia.',
      icon: 'fas fa-flask',
      img: "../../../assets/Barcelona.png",
    },
    {
      title: 'Orientação Especializada',
      content:
        'Conte com professores experientes para guiar sua jornada acadêmica e científica.',
      icon: 'fas fa-user-friends',
      img: '../../../assets/centro.jpg',
    },
    {
      title: 'Bolsas de Estudo',
      content:
        'Oportunidades de bolsas para dedicação exclusiva aos seus projetos de pesquisa.',
      icon: 'fas fa-graduation-cap',
      img: '../../../assets/conceicao.png',
    },
    {
      title: 'Publicações Científicas',
      content:
        'Publique seus resultados em revistas e eventos científicos de renome nacional e internacional.',
      icon: 'fas fa-book-open',
      img: '../../../assets/Barcelona.png',
    },
  ];
}
