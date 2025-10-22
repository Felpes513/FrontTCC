import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { register } from 'swiper/element/bundle';

// Registrar Swiper Web Components
register();

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
    },
    {
      title: 'Orientação Especializada',
      content:
        'Conte com professores experientes para guiar sua jornada acadêmica e científica.',
      icon: 'fas fa-user-friends',
    },
    {
      title: 'Bolsas de Estudo',
      content:
        'Oportunidades de bolsas para dedicação exclusiva aos seus projetos de pesquisa.',
      icon: 'fas fa-graduation-cap',
    },
    {
      title: 'Publicações Científicas',
      content:
        'Publique seus resultados em revistas e eventos científicos de renome nacional e internacional.',
      icon: 'fas fa-book-open',
    },
  ];
}
