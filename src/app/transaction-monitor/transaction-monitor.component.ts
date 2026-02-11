import { Component, OnInit, OnDestroy } from '@angular/core';
// @ts-ignore
import { Chart, ChartData, ChartOptions } from 'chart.js';
import { interval, Subscription } from 'rxjs';
import {NgClass} from "@angular/common";

interface Transaction {
  id: string;
  status: 'pending' | 'completed' | 'canceled' | 'refunded';
}

@Component({
    selector: 'app-transaction-monitor',
    templateUrl: './transaction-monitor.component.html',
    imports: [
        NgClass
    ],
    styleUrls: ['./transaction-monitor.component.css']
})
export class TransactionMonitorComponent implements OnInit, OnDestroy {

  charts: Chart[] = [];
  transactions: Transaction[] = [];
  transactionStatusSub: Subscription | undefined;
  statusOptions: Array<'pending' | 'completed' | 'canceled' | 'refunded'> = ['pending', 'completed', 'canceled', 'refunded'];

  // Datos iniciales para cada gráfico
  chartData: {
    canceled: {
      datasets: {
        borderColor: string;
        backgroundColor: string;
        tension: number;
        data: any[];
        label: string;
        fill: boolean
      }[];
      labels: any[]
    };
    pending: {
      datasets: {
        borderColor: string;
        backgroundColor: string;
        tension: number;
        data: any[];
        label: string;
        fill: boolean
      }[];
      labels: any[]
    };
    refunded: {
      datasets: {
        borderColor: string;
        backgroundColor: string;
        data: any[];
        tensionLines: number;
        label: string;
        fill: boolean
      }[];
      labels: any[]
    };
    completed: {
      datasets: {
        borderColor: string;
        backgroundColor: string;
        tension: number;
        data: any[];
        label: string;
        fill: boolean
      }[];
      labels: any[]
    }
  } = {
    'completed': {
      labels: [],
      datasets: [{
        label: 'Completed Transactions',
        data: [],
        borderColor: 'rgba(40, 167, 69, 1)', // Verde menta
        backgroundColor: 'rgba(40, 167, 69, 0.2)',
        fill: true,
        tension: 0.4
      }]
    },
    'pending': {
      labels: [],
      datasets: [{
        label: 'Pending Transactions',
        data: [],
        borderColor: 'rgba(255, 204, 0, 1)', // Amarillo / Naranja
        backgroundColor: 'rgba(255, 204, 0, 0.2)',
        fill: true,
        tension: 0.4
      }]
    },
    'canceled': {
      labels: [],
      datasets: [{
        label: 'Canceled Transactions',
        data: [],
        borderColor: 'rgba(220, 53, 69, 1)', // Rojo
        backgroundColor: 'rgba(220, 53, 69, 0.2)',
        fill: true,
        tension: 0.4
      }]
    },
    'refunded': {
      labels: [],
      datasets: [{
        label: 'Refunded Transactions',
        data: [],
        borderColor: 'rgba(0, 123, 255, 1)', // Azul
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        fill: true,
        tensionLines: 0.4
      }]
    }
  };

  chartOptions: ChartOptions = {
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {beginAtZero: true}
      }]
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuad'
    }
  };

  ngOnInit(): void {
    this.initCharts();
    this.startMonitoringTransactions();
  }

  initCharts() {
    const chartIds = ['completedChart', 'pendingChart', 'canceledChart', 'refundedChart'];

    chartIds.forEach((chartId, index) => {
      const ctx = document.getElementById(chartId) as HTMLCanvasElement;
      const status = this.statusOptions[index];

      this.charts.push(new Chart(ctx, {
        type: 'line',
        data: this.chartData[status],
        options: this.chartOptions
      }));
    });
  }

  startMonitoringTransactions() {
    // Simulación de transacciones cada 2 segundos
    this.transactionStatusSub = interval(500).subscribe(() => {
      this.addNewTransaction();
    });
  }

  addNewTransaction() {
    // Generar transacción aleatoria
    const newTransaction: Transaction = {
      id: `T-${Math.floor(Math.random() * 10000)}`,
      status: this.statusOptions[Math.floor(Math.random() * this.statusOptions.length)]
    };

    this.transactions.push(newTransaction);

    // Limitar el historial a las últimas 20 transacciones
    if (this.transactions.length > 20) {
      this.transactions.shift();
    }

    // Actualizar gráficos
    this.updateChart(newTransaction);
  }

  updateChart(transaction: Transaction) {
    const status = transaction.status;

    // Añadir transacción a su gráfico correspondiente
    this.chartData[status].labels?.push(transaction.id);
    this.chartData[status].datasets[0].data.push(Math.random() * 500);  // Simular valor de transacción aleatorio

    // Limitar los puntos del gráfico a 20 transacciones
    if (this.chartData[status].labels?.length > 20) {
      this.chartData[status].labels.shift();
      this.chartData[status].datasets[0].data.shift();
    }

    // Actualizar el gráfico correspondiente
    this.charts[this.statusOptions.indexOf(status)].update();
  }

  ngOnDestroy() {
    if (this.transactionStatusSub) {
      this.transactionStatusSub.unsubscribe();
    }
  }
}
