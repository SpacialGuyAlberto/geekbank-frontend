import {Component, Input, OnInit} from '@angular/core';
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import { TransactionsService} from "../../../transactions.service";
import {FormsModule} from "@angular/forms";
import {Transaction} from "../../../models/transaction.model";
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
    NgForOf,
    FormsModule,
    NgClass,
    DatePipe
  ],
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  recentOrders: Order[] = [];
  orderHistory: Order[] = [];
  transactions: Transaction[] = [];
  paginatedTransactions: any[] = []; // Para las transacciones mostradas en la página actual
  currentPage: number = 1;
  itemsPerPage: number = 5; // Cambia el número de elementos por página
  totalPages: number = 0;
  start: string;
  end: string;


  @Input() user: any = {
    email: '',
    name: '',
    phoneNumber: '',
    id: parseInt(<string>sessionStorage.getItem("userId")),
    role: ''
  };

  searchQuery: string = '';
  selectedStatus: string = '';
  dateFrom: string = '';
  dateTo: string = '';

  //      userId: parseInt(<string>sessionStorage.getItem("userId")),

  constructor(private transactionService: TransactionsService) { }

  ngOnInit(): void {
    // this.loadRecentOrders();
    // this.loadOrderHistory();
    this.loadTransactions();
    this.totalPages = Math.ceil(this.transactions.length / this.itemsPerPage);
    this.updatePaginatedTransactions();
  }


  updatePaginatedTransactions(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTransactions = this.transactions.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedTransactions();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedTransactions();
    }
  }

  filterTransactions(): void {
    if (this.user.id && this.start && this.end) {
      this.transactionService.getTransactionsByUserIdAndTimestamp(this.user.id, this.start, this.end)
        .subscribe(
          data => this.transactions = data,
          error => console.error('Error al obtener las transacciones', error)
        );
    }
  }



  loadRecentOrders(): void {
    this.recentOrders = [
      { id: 1, date: '2024-08-28', total: 49.99 },
      { id: 2, date: '2024-08-27', total: 99.99 }
    ];
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'REFUNDED':
        return 'REFUNDED';
      case 'COMPLETED':
        return 'COMPLETED';
      case 'CANCELLED':
        return 'CANCELLED';
      case 'PENDING':
        return 'PENDING';
      default:
        return '';
    }
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
    this.transactionService.getTransactionsById(this.user.id).subscribe(
      (data: Transaction[]) => {
        this.transactions = data;

        // Una vez que las transacciones están cargadas, calcula las páginas
        this.totalPages = Math.ceil(this.transactions.length / this.itemsPerPage);

        // Actualiza las transacciones paginadas
        this.updatePaginatedTransactions();
      }
    );
  }


  filterOrders() {
    this.recentOrders = this.recentOrders.filter(order => {
      const matchesSearchQuery = this.searchQuery ? order.id.toString().includes(this.searchQuery) : true;
      const matchesStatus = this.selectedStatus ? this.transactions.some(transaction => transaction.status === this.selectedStatus && transaction.id === order.id) : true;
      const matchesDateFrom = this.dateFrom ? new Date(order.date) >= new Date(this.dateFrom) : true;
      const matchesDateTo = this.dateTo ? new Date(order.date) <= new Date(this.dateTo) : true;

      return matchesSearchQuery && matchesStatus && matchesDateFrom && matchesDateTo;
    });

    this.orderHistory = this.orderHistory.filter(order => {
      const matchesSearchQuery = this.searchQuery ? order.id.toString().includes(this.searchQuery) : true;
      const matchesStatus = this.selectedStatus ? this.transactions.some(transaction => transaction.status === this.selectedStatus && transaction.id === order.id) : true;
      const matchesDateFrom = this.dateFrom ? new Date(order.date) >= new Date(this.dateFrom) : true;
      const matchesDateTo = this.dateTo ? new Date(order.date) <= new Date(this.dateTo) : true;

      return matchesSearchQuery && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }

  filterTransactions() {
    // Filtra las transacciones según la lógica que ya tienes
    this.transactions = this.transactions.filter(transaction => {
      const matchesSearchQuery = this.searchQuery ? transaction.id.toString().includes(this.searchQuery) : true;
      const matchesStatus = this.selectedStatus ? transaction.status === this.selectedStatus : true;
      const matchesDateFrom = this.dateFrom ? new Date(transaction.timestamp) >= new Date(this.dateFrom) : true;
      const matchesDateTo = this.dateTo ? new Date(transaction.timestamp) <= new Date(this.dateTo) : true;

      return matchesSearchQuery && matchesStatus && matchesDateFrom && matchesDateTo;
    });
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

