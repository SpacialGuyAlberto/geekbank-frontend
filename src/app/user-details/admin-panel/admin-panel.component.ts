import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { GeneralViewComponent } from "./general-view/general-view.component";
import { CurrencyPipe, DatePipe, NgIf } from "@angular/common";
import { ClientsComponent } from './clients/clients.component';
import { ProductsComponent } from './products/products.component';
import { HighlightsConfigComponent } from './highlights-config/highlights-config.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { TransactionMonitorComponent } from "./transaction-monitor/transaction-monitor.component";
// @ts-ignore
import { Chart } from 'chart.js';
import { BackgroundAnimationService } from "../../background-animation.service";
import { ManualSalesComponent } from "./manual-sales/manual-sales.component";
import { interval } from 'rxjs';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    CurrencyPipe,
    GeneralViewComponent,
    ClientsComponent,
    ProductsComponent,
    ManualSalesComponent,
    HighlightsConfigComponent,
    TransactionsComponent,
    TransactionMonitorComponent,
    StatisticsComponent,
    NgIf,
  ],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit, AfterViewInit {
  selectedSection: string = 'general';
  isCollapsed = false;
  isSmallScreen: boolean = false;
  isModalOpen: boolean = false;
  chart: Chart | undefined;

  user: any = {
    role: 'ADMIN', // Simulación de rol, ajusta según tu lógica
    // Otros atributos de usuario
  };

  constructor(private animation: BackgroundAnimationService) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isSmallScreen = window.innerWidth <= 768;
    if (!this.isSmallScreen) {
      this.isModalOpen = false; // Cerrar modal si la pantalla se agranda
    }
  }

  ngOnInit() {
    this.animation.initializeGraphAnimation();
    this.selectSection('general');
    this.isSmallScreen = window.innerWidth <= 768;
  }

  selectSection(section: string) {
    this.selectedSection = section;
    if (this.isSmallScreen) {
      this.isModalOpen = false; // Cerrar modal al seleccionar una sección
    }
  }

  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }

  createDynamicChart() {
    const ctx = document.getElementById('salesChart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: 20 }, (_, i) => `T-${i + 1}`), // Genera etiquetas "T-1", "T-2", etc.
        datasets: [{
          label: 'Transacciones en vivo',
          data: Array.from({ length: 20 }, () => this.getRandomTransactionValue()), // Valores iniciales aleatorios
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuad'
        }
      }
    });

    interval(2000).subscribe(() => {
      this.updateChart();
    });
  }

  // Devuelve un valor de transacción aleatorio, simulando valores de cambio dinámicos
  getRandomTransactionValue(): number {
    return Math.floor(Math.random() * (500 - 100 + 1)) + 100; // Valores entre 100 y 500
  }

  // Actualiza el gráfico con nuevos datos de transacciones
  updateChart() {
    if (this.chart) {
      // Elimina el primer dato y añade un nuevo valor aleatorio
      this.chart.data.datasets[0].data.shift();
      this.chart.data.datasets[0].data.push(this.getRandomTransactionValue());
      this.chart.update();
    }
  }

  ngAfterViewInit() {
    this.createDynamicChart();
  }
}
