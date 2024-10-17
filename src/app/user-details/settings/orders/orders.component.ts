import {Component, Input, OnInit} from '@angular/core';
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import { TransactionsService} from "../../../transactions.service";
import {FormsModule} from "@angular/forms";
import {Transaction, TransactionProduct} from "../../../models/transaction.model";
import {KinguinService} from "../../../kinguin.service";
import {KinguinGiftCard} from "../../../models/KinguinGiftCard";
import {firstValueFrom} from "rxjs";

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
  transactionProducts: TransactionProduct[] = [];
  productPictures: string[] = [];
  paginatedTransactions: Transaction[] = []; // Para las transacciones mostradas en la página actual
  currentPage: number = 1;
  itemsPerPage: number = 5; // Cambia el número de elementos por página
  totalPages: number = 0;

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
  private productDetailsCache: Map<number, KinguinGiftCard> = new Map();


  //      userId: parseInt(<string>sessionStorage.getItem("userId")),

  constructor(
    private transactionService: TransactionsService,
    private kinguinService: KinguinService
    ) { }

  ngOnInit(): void {
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
    this.orderHistory = [
      { id: 3, date: '2024-08-20', total: 29.99 },
      { id: 4, date: '2024-08-15', total: 59.99 },
      { id: 5, date: '2024-08-10', total: 89.99 }
    ];
  }

  async loadTransactions(): Promise<void> {
    try {
      const data = await firstValueFrom(this.transactionService.getTransactionsById(this.user.id));

      if (!data || !Array.isArray(data)) {
        console.error('No se recibieron datos válidos para las transacciones.');
        return;
      }

      for (const transaction of data) {
        for (const product of transaction.products) {

          // if (this.productDetailsCache.has(product.productId)) {
          //   product.image = this.productDetailsCache.get(product.productId)?.coverImage || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNDaMqKyDwBijFd-y-JsluVcSaQ2dYR5DEM4qUkuiTvnq8mNtI6oyI5JZdgWGqMYb7xfQ&usqp=CAU";
          // } else {
          //   product.image = await this.fetchProductPicture(product.productId);
          //
          // }
          product.image = await this.fetchProductPicture(product.productId);
          product.name = this.productDetailsCache.get(product.productId)?.name;
          this.transactionProducts.push(product);
        }
      }

      this.transactions = data;
      this.totalPages = Math.ceil(this.transactions.length / this.itemsPerPage);
      this.updatePaginatedTransactions();
    } catch (error) {
      console.error('Error al cargar las transacciones:', error);
    }
  }

  async fetchProductPicture(productId: number): Promise<string> {
    try {
      const card = await firstValueFrom(this.kinguinService.getGiftCardDetails(productId.toString()));
      const imageUrl = card.images.cover?.thumbnail || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNDaMqKyDwBijFd-y-JsluVcSaQ2dYR5DEM4qUkuiTvnq8mNtI6oyI5JZdgWGqMYb7xfQ&usqp=CAU";
      // Cachear los detalles del producto
      this.productDetailsCache.set(productId, card);
      return imageUrl;
    } catch (error) {
      console.error(`Error al obtener detalles del producto ID ${productId}:`, error);
      return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNDaMqKyDwBijFd-y-JsluVcSaQ2dYR5DEM4qUkuiTvnq8mNtI6oyI5JZdgWGqMYb7xfQ&usqp=CAU"; // URL de imagen por defecto
    }
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

