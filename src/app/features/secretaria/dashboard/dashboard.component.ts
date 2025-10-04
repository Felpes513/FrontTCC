import { Component } from '@angular/core';
import { NgChartsModule } from 'ng2-charts';
import {
  ChartConfiguration,
  ChartOptions
} from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['SGPIC', 'IA Aplicada', 'Data Science'],
    datasets: [
      { data: [10, 5, 8], label: 'Inscritos', backgroundColor: '#42A5F5' },
      { data: [10, 5, 7], label: 'Validados', backgroundColor: '#FFCA28' },
      { data: [4, 3, 4], label: 'Cadastrados', backgroundColor: '#66BB6A' }
    ]
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Status de Alunos por Projeto' }
    }
  };
}
