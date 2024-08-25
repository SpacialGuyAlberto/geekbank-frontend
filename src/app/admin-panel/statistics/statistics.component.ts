import { Component } from '@angular/core';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent {
  barChartData: any;
  barChartLabels: any;
  barChartOptions: any;
  barChartLegend: any;
  barChartType: any;
  pieChartData: any;
  pieChartLabels: any;
  pieChartOptions: any;
  pieChartType: any;

}
