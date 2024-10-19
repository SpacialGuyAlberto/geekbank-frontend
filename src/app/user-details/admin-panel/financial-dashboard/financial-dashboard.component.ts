import { Component, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js';
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-financial-dashboard',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    CurrencyPipe,
    DatePipe,
    NgForOf
  ],
  templateUrl: './financial-dashboard.component.html',
  styleUrls: ['./financial-dashboard.component.css']
})
export class FinancialDashboardComponent implements AfterViewInit {

  selectedTab: string = 'netProfit';

  financialData = [
    { type: 'Gasto', category: 'Marketing', amount: 3000, date: new Date('2023-09-15') },
    { type: 'Gasto', category: 'Operaciones', amount: 2500, date: new Date('2023-09-20') },
    { type: 'Inversión', category: 'Tecnología', amount: 5000, date: new Date('2023-08-10') },
    { type: 'Ganancia', category: 'Ventas', amount: 10000, date: new Date('2023-09-25') },
    // Agrega más datos según sea necesario
  ];

  ngAfterViewInit() {
    // Inicializa el gráfico de la pestaña por defecto
    this.loadChartData(this.selectedTab);
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
    this.loadChartData(tab);
  }

  loadChartData(chartType: string) {
    switch (chartType) {
      case 'netProfit':
        this.createNetProfitChart();
        break;
      case 'expenses':
        this.createExpensesChart();
        break;
      case 'assetsLiabilities':
        this.createAssetsLiabilitiesChart();
        break;
      case 'cashFlow':
        this.createCashFlowChart();
        break;
      case 'externalServices':
        this.createExternalServicesChart();
        break;
      default:
        console.error('Tipo de gráfico no reconocido');
    }
  }

  createNetProfitChart() {
    const ctx = document.getElementById('netProfitChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
          datasets: [{
            label: 'Ganancia Neta Mensual',
            data: [5000, 7000, 6000, 8000, 7500, 9000, 8500, 9500, 10000, 11000, 10500, 11500],
            backgroundColor: 'rgba(0, 200, 83, 0.2)',
            borderColor: '#00c853',
            borderWidth: 2,
            fill: true,
            lineTension: 0.1 // Reemplazamos 'tension' por 'lineTension'
          }]
        },
        options: {
          responsive: true,
          legend: {
            labels: {
              fontColor: '#fff' // Reemplazamos 'color' por 'fontColor'
            }
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                fontColor: '#fff'
              },
              gridLines: {
                color: '#555' // Reemplazamos 'grid' por 'gridLines'
              }
            }],
            xAxes: [{
              ticks: {
                fontColor: '#fff'
              },
              gridLines: {
                color: '#555'
              }
            }]
          }
        }
      });
    }
  }

  // Repite los mismos cambios en los demás métodos de creación de gráficos

  createExpensesChart() {
    const ctx = document.getElementById('expensesChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Marketing', 'Operaciones', 'RRHH', 'Tecnología'],
          datasets: [{
            data: [30, 25, 20, 25],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
          }]
        },
        options: {
          responsive: true,
          legend: {
            labels: {
              fontColor: '#fff' // Reemplazamos 'color' por 'fontColor'
            }
          }
        }
      });
    }
  }

  createAssetsLiabilitiesChart() {
    const ctx = document.getElementById('assetsLiabilitiesChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Activos', 'Pasivos'],
          datasets: [{
            label: 'Valor en USD',
            data: [150000, 80000],
            backgroundColor: ['#4BC0C0', '#FF6384']
          }]
        },
        options: {
          responsive: true,
          legend: {
            labels: {
              fontColor: '#fff'
            }
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                fontColor: '#fff'
              },
              gridLines: {
                color: '#555'
              }
            }],
            xAxes: [{
              ticks: {
                fontColor: '#fff'
              },
              gridLines: {
                color: '#555'
              }
            }]
          }
        }
      });
    }
  }

  createCashFlowChart() {
    const ctx = document.getElementById('cashFlowChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          datasets: [{
            label: 'Flujo de Caja',
            data: [10000, 8000, 12000, 9000, 11000, 13000],
            backgroundColor: 'rgba(255, 193, 7, 0.2)',
            borderColor: '#ffc107',
            borderWidth: 2,
            fill: true,
            lineTension: 0.1 // Reemplazamos 'tension' por 'lineTension'
          }]
        },
        options: {
          responsive: true,
          legend: {
            labels: {
              fontColor: '#fff'
            }
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                fontColor: '#fff'
              },
              gridLines: {
                color: '#555'
              }
            }],
            xAxes: [{
              ticks: {
                fontColor: '#fff'
              },
              gridLines: {
                color: '#555'
              }
            }]
          }
        }
      });
    }
  }

  createExternalServicesChart() {
    const ctx = document.getElementById('externalServicesChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['AWS', 'Google Cloud', 'Stripe', 'PayPal'],
          datasets: [{
            data: [40, 30, 20, 10],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
          }]
        },
        options: {
          responsive: true,
          legend: {
            labels: {
              fontColor: '#fff' // Reemplazamos 'color' por 'fontColor'
            }
          }
        }
      });
    }
  }

  exportToCSV() {
    const csvData = this.convertToCSV(this.financialData);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Crea un enlace temporal para descargar el archivo
    const link = document.createElement('a');
    link.href = url;
    link.download = 'financial_data.csv';
    link.click();
  }

  convertToCSV(objArray: any[]): string {
    const headers = Object.keys(objArray[0]).join(',');
    const rows = objArray.map(obj => Object.values(obj).join(','));
    return [headers, ...rows].join('\n');
  }

  filterData(type: string) {
    if (type === 'Todos') {
      // Restablecer al conjunto de datos original
      this.filteredData = [...this.financialData];
    } else {
      this.filteredData = this.financialData.filter(item => item.type === type);
    }
  }

  filteredData = [...this.financialData];

}
