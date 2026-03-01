import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
// @ts-ignore
import { Chart } from 'chart.js';
import { CurrencyPipe } from "@angular/common";
import { TransactionsService } from "../transactions/transactions.service";
import { UserService } from "../user-details/user.service";
import { User } from "../user-details/User";
import { Transaction } from "../transactions/transaction.model";
import { VisitService } from "../admin-panel/visit.service";
import { SalesMetrics } from "../models/salesMetrics.model";
import { SalesMetricsService } from "../services/sales-metrics.service";

@Component({
  selector: 'app-general-view',
  imports: [
    CurrencyPipe
  ],
  templateUrl: './general-view.component.html',
  styleUrl: './general-view.component.css'
})
export class GeneralViewComponent implements OnInit, AfterViewInit {
  @Input() totalCustomers: number = 0;

  totalSales = 0;
  totalProfit = 0;
  totalClients = 200;
  totalTransactions: number = 0;
  completedTransactions = 1200;
  pendingOrders = 50;
  totalProducts = 3000;
  salesMetrics: SalesMetrics | undefined = undefined;
  protected visitCount: number = 0;

  constructor(
    private salesMetricService: SalesMetricsService,
    private transactionService: TransactionsService,
    private userService: UserService,
    private visitService: VisitService
  ) { }

  ngOnInit(): void {
    this.fetchCompletedTTransactions();
    this.fetchCustomers();
    this.getVisitCount();
    this.getSalesMetrics();
  }

  ngAfterViewInit() {
    this.createMonthlySalesChart();
    this.createTopCategoriesChart();

  }


  fetchCompletedTTransactions() {
    this.transactionService.getTransactions().subscribe((data => {
      this.completedTransactions = data.filter(transaction => transaction.status === 'COMPLETED').length;
    })
    )
  }

  fetchCustomers() {
    this.userService.getUsers()
      .subscribe(data => {
        this.totalCustomers = data.filter(customer => customer.role === 'CUSTOMER').length;
      })
  }

  createMonthlySalesChart() {
    const ctx = document.getElementById('monthlySalesChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre'],
          datasets: [{
            label: 'Ventas Mensuales',
            data: [5000, 6000, 8000, 7000, 9000, 10000, 11000, 12000, 13000],
            backgroundColor: '#0a84ff',
            borderColor: '#0a84ff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          scales: {
            yAxes: [{
              gridLines: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                fontColor: 'rgba(255, 255, 255, 0.6)',
                beginAtZero: true,
              }
            }],
            xAxes: [{
              gridLines: {
                display: false
              },
              ticks: {
                fontColor: 'rgba(255, 255, 255, 0.6)'
              }
            }]
          },
          plugins: {
            legend: {
              labels: {
                color: '#fff'
              }
            },
            title: {
              display: true,
              text: 'Ventas Mensuales',
              color: '#fff',
              font: {
                size: 18
              }
            }
          }
        }
      });
    }
  }

  createTopCategoriesChart() {
    const ctx = document.getElementById('topCategoriesChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Electrónica', 'Ropa', 'Hogar', 'Juguetes'],
        datasets: [{
          data: [35, 25, 20, 20],
          backgroundColor: ['#0a84ff', '#bf5af2', '#ff375f', '#ffd60a']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: '#fff'
            }
          },
          title: {
            display: true,
            text: 'Categorías más Vendidas',
            color: '#fff',
            font: {
              size: 18
            }
          }
        }
      }
    });
  }

  getVisitCount() {
    this.visitService.getVisitCount().subscribe(count => {
      this.visitCount = count;
    }, error => {
      console.error('Error al obtener el conteo de visitas', error);
    });
  }

  getSalesMetrics() {
    this.salesMetricService.getCurrentMetrics().subscribe(data => {
      this.salesMetrics = data;

    })
  }
}
