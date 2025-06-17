import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwiperModule } from 'swiper/angular';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SwiperModule, NavbarComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
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
