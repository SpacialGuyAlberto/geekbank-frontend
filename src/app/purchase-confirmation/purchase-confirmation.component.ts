// src/app/purchase-confirmation/purchase-confirmation.component.ts
import { Component, OnInit } from '@angular/core';
import { TransactionsService } from '../transactions.service';
import { Transaction } from '../models/transaction.model';
import { ActivatedRoute, Router } from '@angular/router';
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-purchase-confirmation',
  standalone: true,
  imports: [NgForOf, NgIf, FormsModule, DatePipe, CurrencyPipe, NgClass],
  templateUrl: './purchase-confirmation.component.html',
  styleUrls: ['./purchase-confirmation.component.css']
})
export class PurchaseConfirmationComponent implements OnInit {
  transactions: Transaction[] = [];
  paginatedTransactions: Transaction[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  // Filtros
  searchQuery: string = '';
  selectedStatus: string = '';
  dateFrom: string = '';
  dateTo: string = '';

  // Paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Transacción reciente
  recentTransaction: Transaction | null = null;

  constructor(
    private transactionsService: TransactionsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener el transactionNumber de los parámetros de la ruta
    this.route.queryParams.subscribe(params => {
      const transactionNumber = params['transactionNumber'];
      if (transactionNumber) {
        this.fetchTransactionByNumber(transactionNumber);
      } else {
        this.fetchAllTransactions();
      }
    });
  }

  /**
   * Obtiene una transacción específica por su transactionNumber
   */
  fetchTransactionByNumber(transactionNumber: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.transactionsService.getTransactionByNumber(transactionNumber).subscribe(
      (transaction: Transaction) => {
        this.recentTransaction = transaction;
        this.paginatedTransactions = [transaction];
        this.totalPages = 1;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al obtener la transacción:', error);
        this.errorMessage = 'Error al cargar la transacción.';
        this.isLoading = false;
      }
    );
  }

  /**
   * Obtiene todas las transacciones del usuario
   */
  fetchAllTransactions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const userId = sessionStorage.getItem('userId');
    if (userId) {
      this.transactionsService.getTransactionsById(Number(userId)).subscribe(
        (data: Transaction[]) => {
          this.transactions = data;
          this.applyFilters();
          this.isLoading = false;
        },
        (error) => {
          console.error('Error al obtener las transacciones:', error);
          this.errorMessage = 'Error al cargar las transacciones.';
          this.isLoading = false;
        }
      );
    } else {
      this.errorMessage = 'Usuario no autenticado.';
      this.isLoading = false;
    }
  }

  /**
   * Aplica filtros y paginación
   */
  applyFilters(): void {
    let filtered = this.transactions;

    // Filtrar por búsqueda
    if (this.searchQuery) {
      filtered = filtered.filter(t =>
        t.transactionNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        t.products.some(p => p.name?.toLowerCase().includes(this.searchQuery.toLowerCase()))
      );
    }

    // Filtrar por estado
    if (this.selectedStatus) {
      filtered = filtered.filter(t => t.status === this.selectedStatus);
    }

    // Filtrar por fecha
    if (this.dateFrom) {
      const fromDate = new Date(this.dateFrom);
      filtered = filtered.filter(t => new Date(t.timestamp) >= fromDate);
    }

    if (this.dateTo) {
      const toDate = new Date(this.dateTo);
      filtered = filtered.filter(t => new Date(t.timestamp) <= toDate);
    }

    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    this.currentPage = 1;
    this.paginatedTransactions = filtered.slice(0, this.pageSize);
  }

  /**
   * Eventos de cambio en filtros
   */
  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  /**
   * Paginación
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedTransactions = this.transactions.slice(start, end);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  /**
   * Filtrar transacciones
   */
  filterTransactions(): void {
    this.applyFilters();
  }

  /**
   * Resetear filtros
   */
  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.applyFilters();
  }
}
