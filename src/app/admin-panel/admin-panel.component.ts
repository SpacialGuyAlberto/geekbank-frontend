import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { CommonModule, NgIf } from "@angular/common";
import { GeneralViewComponent } from "../general-view/general-view.component";
import { ClientsComponent } from '../clients/clients.component';
import { ProductsComponent } from '../products/products.component';
import { HighlightsConfigComponent } from '../highlights-config/highlights-config.component';
import { TransactionsComponent } from '../transactions/transactions.component';
import { StatisticsComponent } from '../statistics/statistics.component';
import { ManualSalesComponent } from "../manual-sales/manual-sales.component";
import { FeedbackListComponent } from "../feedback-list/feedback-list.component";
import { EmployeeDashboardComponent } from "../employee-dashboard/employee-dashboard.component";
import { FinancialDashboardComponent } from "../financial-dashboard/financial-dashboard.component";
import { MainScreenGiftCardConfigComponent } from "../main-screen-gift-card-config/main-screen-gift-card-config.component";
import { TournamentConfigComponent } from "../tournament-announcement/tournament-config/tournament-config.component";
import { FlashSaleComponent } from "../flash-sale/flash-sale.component";
import { FlashSalesConfigComponent } from "../flash-sale/config/flash-sales-config.component";
import { SyncComponent } from '../sync/sync.component';
import { CombosConfigComponent } from '../combos/config/combos-config.component';
import { BackgroundAnimationService } from "../services/background-animation.service";
import { Chart } from 'chart.js';
import { interval } from 'rxjs';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    GeneralViewComponent,
    ClientsComponent,
    ProductsComponent,
    ManualSalesComponent,
    HighlightsConfigComponent,
    TransactionsComponent,
    StatisticsComponent,
    NgIf,
    FeedbackListComponent,
    EmployeeDashboardComponent,
    FinancialDashboardComponent,
    MainScreenGiftCardConfigComponent,
    TournamentConfigComponent,
    FlashSaleComponent,
    FlashSalesConfigComponent,
    SyncComponent,
    CombosConfigComponent
  ],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit, AfterViewInit {
  selectedSection: string = 'general';
  customers: number = 0;
  isSmallScreen: boolean = false;
  isModalOpen: boolean = false;
  chart: Chart | undefined;

  user: any = {
    role: 'ADMIN',
  };

  constructor(private animation: BackgroundAnimationService) { }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isSmallScreen = window.innerWidth <= 768;
    if (!this.isSmallScreen) {
      this.isModalOpen = false;
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
      this.isModalOpen = false;
    }
  }

  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }

  createDynamicChart() {
    const ctx = document.getElementById('salesChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array.from({ length: 20 }, (_, i) => `T-${i + 1}`),
          datasets: [{
            label: 'Transacciones en vivo',
            data: Array.from({ length: 20 }, () => this.getRandomTransactionValue()),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            lineTension: 0.4
          }]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          },
          animation: {
            duration: 1000,
            easing: 'easeInOutQuad'
          }
        }
      });
    }
    interval(2000).subscribe(() => {
      this.updateChart();
    });
  }

  getRandomTransactionValue(): number {
    return Math.floor(Math.random() * (500 - 100 + 1)) + 100; // Valores entre 100 y 500
  }

  updateChart() {
    this.chart?.data?.datasets?.[0]?.data?.shift();
    this.chart?.data?.datasets?.[0]?.data?.push(this.getRandomTransactionValue());
    this.chart?.update();
  }

  handleCustomersChange(newCustomers: number) {
    this.customers = newCustomers;
  }

  ngAfterViewInit() {
    this.createDynamicChart();
  }
}
