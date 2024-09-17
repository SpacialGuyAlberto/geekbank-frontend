import { Component, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import {CurrencyPipe, DatePipe, NgClass, NgForOf} from "@angular/common";

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    CurrencyPipe,
    NgForOf,
    NgClass
  ],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  startDate: any;
  endDate: any;
  transactions: any[] = [];

  ngOnInit() {
    this.loadTransactions();
  }

  // Cargar las transacciones (simulación de datos)
  loadTransactions() {
    this.transactions = [
      { id: 1, clientName: 'Juan Pérez', timestamp: new Date(), description: 'Compra de productos', status: 'COMPLETED', amount: 120.50 },
      { id: 2, clientName: 'Ana Gómez', timestamp: new Date(), description: 'Pago de servicio', status: 'PENDING', amount: 75.00 },
      { id: 3, clientName: 'Carlos Díaz', timestamp: new Date(), description: 'Reembolso por devolución', status: 'REFUNDED', amount: 50.00 },
      { id: 4, clientName: 'María López', timestamp: new Date(), description: 'Compra de productos', status: 'CANCELLED', amount: 40.25 }
    ];
  }

  // Función para filtrar transacciones
  filterTransactions() {
    // Aquí iría la lógica para filtrar transacciones
    console.log('Filtrar transacciones');
  }

  // Función para exportar transacciones como CSV
  exportTransactions() {
    // Aquí iría la lógica para exportar transacciones
    console.log('Exportar transacciones como CSV');
  }
}
