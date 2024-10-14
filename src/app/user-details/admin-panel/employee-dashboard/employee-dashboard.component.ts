import {AfterViewInit, Component, OnInit} from '@angular/core';
import {DatePipe, DecimalPipe} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {NgxChartsModule} from "@swimlane/ngx-charts";

import {ChartData, ChartOptions} from "chart.js";
// @ts-ignore
import {Chart} from "chart.js";
@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    NgxChartsModule
  ],
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements AfterViewInit {

  // Información personal básica
  employee = {
    name: 'Luis Alberto',
    position: 'Desarrollador de Software',
    startDate: new Date('2020-01-15'),
    status: 'Activo'
  };

  // Ganancias
  earnings = {
    baseSalary: 50000, // Salario base anual
    bonuses: 5000,
    commissions: 2000,
    totalEarned: 58000, // Total ganado
    totalWithdrawn: 10000, // Total retirado hasta la fecha
    availableToWithdraw: 48000 // Ganancias disponibles para retirar
  };

  // Historial de retiros
  withdrawalHistory: Array<{ date: Date, amount: number }> = [
    { date: new Date('2023-09-15'), amount: 2000 },
    { date: new Date('2023-08-20'), amount: 1500 },
    { date: new Date('2023-07-10'), amount: 1800 },
  ];

  // Monto del retiro que el usuario desea hacer
  withdrawalAmount = 0;

  selectedChart: string = 'monthlyEarnings';

  constructor() { }

  ngAfterViewInit() {
    this.createMonthlyEarningsChart();
    this.createWithdrawalHistoryChart();
  }

  // Método para realizar un retiro
  withdraw() {
    if (this.withdrawalAmount <= 0 || this.withdrawalAmount > this.earnings.availableToWithdraw) {
      alert('Por favor, introduce un monto válido para retirar.');
      return;
    }

    // Lógica para realizar el retiro a través de PayPal
    alert(`Has retirado $${this.withdrawalAmount} a tu cuenta de PayPal.`);

    // Actualizar las ganancias disponibles
    this.earnings.availableToWithdraw -= this.withdrawalAmount;
    this.earnings.totalWithdrawn += this.withdrawalAmount;

    // Agregar el retiro al historial
    this.withdrawalHistory.unshift({
      date: new Date(),
      amount: this.withdrawalAmount
    });

    this.withdrawalAmount = 0;
  }

  createMonthlyEarningsChart() {
    const ctx = document.getElementById('monthlyEarningsChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
          datasets: [{
            label: 'Ganancias Mensuales',
            data: [4000, 4500, 4200, 5000, 4800, 5300, 5500, 6000, 5800, 6200, 6100, 6300],
            backgroundColor: '#ff7a00',
            borderColor: '#e66a00',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
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
          },
          legend: {
            labels: {
              fontColor: '#fff'
            }
          },
          tooltips: {
            enabled: true,
            backgroundColor: '#333',
            titleFontColor: '#fff',
            bodyFontColor: '#fff',
            borderColor: '#fff',
            borderWidth: 1
          }
        }
      });
    }
  }

  createWithdrawalHistoryChart() {
    const ctx = document.getElementById('withdrawalHistoryChart') as HTMLCanvasElement;
    if (ctx) {
      const labels = this.withdrawalHistory.map(item => item.date.toLocaleDateString());
      const data = this.withdrawalHistory.map(item => item.amount);

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Historial de Retiros',
            data: data,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: '#4BC0C0',
            borderWidth: 2,
            fill: true,
            lineTension: 0.1
          }]
        },
        options: {
          responsive: true,
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
          },
          legend: {
            labels: {
              fontColor: '#fff'
            }
          },
          tooltips: {
            enabled: true,
            backgroundColor: '#333',
            titleFontColor: '#fff',
            bodyFontColor: '#fff',
            borderColor: '#fff',
            borderWidth: 1
          }
        }
      });
    }
  }

}
