import { Component, OnInit } from '@angular/core';
import {CurrencyPipe} from "@angular/common";

interface Order {
  id: number;
  date: string;
  total: number;
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  standalone: true,
  imports: [
    CurrencyPipe
  ],
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  recentOrders: Order[] = [];
  orderHistory: Order[] = [];

  constructor() { }

  ngOnInit(): void {
    this.loadRecentOrders();
    this.loadOrderHistory();
  }

  loadRecentOrders(): void {
    // Simulación de datos recientes
    this.recentOrders = [
      { id: 1, date: '2024-08-28', total: 49.99 },
      { id: 2, date: '2024-08-27', total: 99.99 }
    ];
  }

  loadOrderHistory(): void {
    // Simulación de historial de pedidos
    this.orderHistory = [
      { id: 3, date: '2024-08-20', total: 29.99 },
      { id: 4, date: '2024-08-15', total: 59.99 },
      { id: 5, date: '2024-08-10', total: 89.99 }
    ];
  }

  viewOrderDetails(order: Order): void {
    // Lógica para ver detalles del pedido
    console.log('Ver detalles del pedido', order);
  }

  trackShipment(order: Order): void {
    // Lógica para rastrear el envío
    console.log('Rastrear envío del pedido', order);
  }

  reorder(order: Order): void {
    // Lógica para volver a comprar el pedido
    console.log('Recomprar pedido', order);
  }
}

