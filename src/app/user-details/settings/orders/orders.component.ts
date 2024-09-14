import {Component, Input, OnInit} from '@angular/core';
import {CurrencyPipe, NgForOf, NgIf} from "@angular/common";
import {Transaction, TransactionsService} from "../../../transactions.service";
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
    CurrencyPipe,
    NgIf,
    NgForOf
  ],
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  recentOrders: Order[] = [];
  orderHistory: Order[] = [];
  transactions: Transaction[] = [];

  @Input() user: any = {
    email: '',
    name: '',
    phoneNumber: '',
    id: 0,
    role: ''
  };

  //      userId: parseInt(<string>sessionStorage.getItem("userId")),

  constructor(private transactionService: TransactionsService) { }

  ngOnInit(): void {
    this.loadRecentOrders();
    this.loadOrderHistory();
    this.loadTransactions();
  }

  loadRecentOrders(): void {
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

  loadTransactions(): void {
    if (this.user.role == 'ADMIN'){
      this.transactionService.getTransactions().subscribe(
        (data: Transaction[]) => {
          this.transactions = data;
        },
        (error) => {
          console.error('Error fetching transactions', error);
        }
      );
    }  else {
      this.transactionService.getTransactionsById(this.user.id).subscribe(
        (data: Transaction[]) => {
          this.transactions = data;
        }
      )
    }
  }

  viewOrderDetails(order: Order): void {
    console.log('Ver detalles del pedido', order);
  }

  trackShipment(order: Order): void {
    console.log('Rastrear envío del pedido', order);
  }

  reorder(order: Order): void {
    console.log('Recomprar pedido', order);
  }
}

