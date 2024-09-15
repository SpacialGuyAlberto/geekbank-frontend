import { AfterViewInit, Component } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { CurrencyPipe, DatePipe, NgIf } from "@angular/common";
import { ClientsComponent } from './clients/clients.component';
import { ProductsComponent } from './products/products.component';
import { HighlightsConfigComponent } from './highlights-config/highlights-config.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { BackgroundAnimationService } from "../background-animation.service";
// @ts-ignore
import { Chart } from 'chart.js';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    CurrencyPipe,
    ClientsComponent,
    ProductsComponent,
    HighlightsConfigComponent,
    TransactionsComponent,
    StatisticsComponent,
    NgIf,
  ],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements AfterViewInit {
  selectedSection: string = 'general'; // Cambia a 'general' para la vista inicial

  constructor(private animation: BackgroundAnimationService) {}

  ngOnInit() {
    this.animation.initializeGraphAnimation();
  }

  selectSection(section: string) {
    this.selectedSection = section;
  }

  createSalesChart() {
    const ctx = document.getElementById('salesChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'],
        datasets: [{
          label: 'Ventas mensuales',
          data: [100, 150, 200, 120, 240, 350, 400, 450, 500],
          borderColor: 'rgba(75, 192, 192, 1)',
          fill: false
        }]
      }
    });
  }

  ngAfterViewInit() {
    this.createSalesChart();
    this.createCategoryChart();
  }

  createCategoryChart() {
    const ctx = document.getElementById('categoryChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Electrónica', 'Ropa', 'Juguetes', 'Comida'],
        datasets: [{
          data: [30, 25, 20, 25],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
        }]
      }
    });
  }
}
