import { Component } from '@angular/core';
// @ts-ignore
import { Chart } from 'chart.js';
import {CurrencyPipe} from "@angular/common";

@Component({
  selector: 'app-general-view',
  standalone: true,
  imports: [
    CurrencyPipe
  ],
  templateUrl: './general-view.component.html',
  styleUrl: './general-view.component.css'
})
export class GeneralViewComponent {
  // Datos ficticios que deberían venir de tu API o backend.
  totalSales = 50000; // Monto de ventas totales
  totalProfit = 15000; // Ganancias después de los costos
  totalClients = 200; // Número de clientes
  completedTransactions = 1200; // Transacciones completadas
  pendingOrders = 50; // Pedidos pendientes
  totalProducts = 3000; // Inventario total de productos

  ngAfterViewInit() {
    this.createMonthlySalesChart();
    this.createTopCategoriesChart();
  }

  createMonthlySalesChart() {
    const ctx = document.getElementById('monthlySalesChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre'],
        datasets: [{
          label: 'Ventas Mensuales',
          data: [5000, 6000, 8000, 7000, 9000, 10000, 11000, 12000, 13000],
          backgroundColor: '#36A2EB'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  createTopCategoriesChart() {
    const ctx = document.getElementById('topCategoriesChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Electrónica', 'Ropa', 'Hogar', 'Juguetes'],
        datasets: [{
          data: [35, 25, 20, 20],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
        }]
      },
      options: {
        responsive: true
      }
    });
  }
}
