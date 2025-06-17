import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { register } from 'swiper/element/bundle';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  
  ngOnInit() {
    register();
  }

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
}