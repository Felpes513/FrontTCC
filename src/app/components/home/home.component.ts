import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';

// Registra os elementos customizados do Swiper
register();

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeComponent implements OnInit {

  slides = [
    {
      title: 'Pesquisa & Inovação',
      content: 'Desenvolva projetos de pesquisa que podem transformar o conhecimento científico'
    },
    {
      title: 'Orientação Especializada',
      content: 'Trabalhe com professores experientes em diversas áreas do conhecimento'
    },
    {
      title: 'Desenvolvimento Acadêmico',
      content: 'Prepare-se para a pós-graduação e construa uma carreira sólida na pesquisa'
    },
    {
      title: 'Publicações Científicas',
      content: 'Tenha a oportunidade de publicar seus resultados em revistas acadêmicas'
    }
  ];

  constructor() {
    console.log('HomeComponent criado');
  }

  ngOnInit(): void {
    console.log('HomeComponent iniciado com slides:', this.slides);
  }
}
