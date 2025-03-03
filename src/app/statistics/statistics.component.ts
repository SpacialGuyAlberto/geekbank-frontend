import { Component, AfterViewInit } from '@angular/core';
// @ts-ignore
import { Chart } from 'chart.js';
import {NgClass, NgIf} from "@angular/common";

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  standalone: true,
  imports: [
    NgClass,
    NgIf
  ],
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements AfterViewInit {
  selectedChart: string = 'ventasMensuales';
  selectedTab: string = 'sales';

  ngAfterViewInit() {
    this.createSalesChart();
    this.createSalesByCategoryChart();
    this.createCustomerBehaviorChart();
    this.createTrafficSourcesChart();
    this.createInventoryChart();
    this.createOrdersChart();
  }

  showChart(chart: string) {
    this.selectedChart = chart;
    this.loadChartData(chart);
  }
  selectTab(tab: string) {
    this.selectedTab = tab;
    this.loadChartData(tab);
  }


  loadChartData(chartType: string) {
    switch (chartType) {
      case 'sales':
        this.createSalesChart();
        break;
      case 'category':
        this.createSalesByCategoryChart();
        break;
      case 'behavior':
        this.createCustomerBehaviorChart();
        break;
      case 'traffic':
        this.createTrafficSourcesChart();
        break;
      case 'inventory':
        this.createInventoryChart();
        break;
      case 'orders':
        this.createOrdersChart();
        break;
      default:
        console.error('Chart type not recognized');
    }
  }

  createSalesChart() {
    const ctx = document.getElementById('salesChart') as HTMLCanvasElement;
    if (ctx){
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'],
          datasets: [{
            label: 'Ventas mensuales',
            data: [100, 120, 150, 100, 180, 220, 300, 350, 400],
            backgroundColor: '#ffcc00', // Color de las barras
            borderColor: '#ffcc00',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            yAxes: [{
              gridLines: {
                color: '#555' // Color de las líneas de la cuadrícula
              },
              ticks: {
                fontColor: '#fff', // Color de las etiquetas del eje Y
                beginAtZero: true,
              }
            }],
            xAxes: [{
              ticks: {
                fontColor: '#fff' // Color de las etiquetas del eje X
              }
            }]
          },
          plugins: {
            legend: {
              labels: {
                color: '#fff' // Color del texto de la leyenda
              }
            },
            title: {
              display: false
            }
          }
        }
      });
    }

  }


  createSalesByCategoryChart() {
    const ctx = document.getElementById('salesByCategoryChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Action Games', 'Spotify Giftcards', 'Amazon', 'Free fire'],
        datasets: [{
          data: [30, 25, 20, 25],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
        }]
      },
      options: {
        responsive: true,
      }
    });
  }

  createCustomerBehaviorChart() {
    const ctx = document.getElementById('customerBehaviorChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Clientes Nuevos', 'Clientes Recurrentes'],
        datasets: [{
          data: [65, 35],
          backgroundColor: ['#4BC0C0', '#FF6384']
        }]
      },
      options: {
        responsive: true,
      }
    });
  }

  createTrafficSourcesChart() {
    const ctx = document.getElementById('trafficSourcesChart') as HTMLCanvasElement;
    if (ctx){
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Redes Sociales', 'Email', 'Búsqueda Orgánica', 'Anuncios'],
          datasets: [{
            label: 'Visitas por Canal',
            data: [150, 200, 300, 100],
            backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384', '#4BC0C0']
          }]
        },
        options: {
          responsive: true,
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
    }
  }

  createInventoryChart() {
    const ctx = document.getElementById('inventoryChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Producto 1', 'Producto 2', 'Producto 3', 'Producto 4'],
        datasets: [{
          label: 'Stock de Inventario',
          data: [10, 5, 20, 15],
          backgroundColor: '#4BC0C0',
          borderColor: '#4BC0C0',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true
      }
    });
  }

  createOrdersChart() {
    const ctx = document.getElementById('ordersChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Pendientes', 'Completados', 'Cancelados'],
        datasets: [{
          label: 'Pedidos',
          data: [15, 40, 5],
          backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384']
        }]
      },
      options: {
        responsive: true,
        scales: {
          yAxes: [{
            ticks: {beginAtZero: true}
          }]
        }
      }
    });
  }
}
