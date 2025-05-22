import { Component, Input, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf } from "@angular/common";
import { TransactionsService } from "../../../transactions/transactions.service";
import { FormsModule } from "@angular/forms";
import { Transaction, TransactionProduct } from "../../../transactions/transaction.model";
import { KinguinService } from "../../../kinguin-gift-cards/kinguin.service";
import { KinguinGiftCard } from "../../../kinguin-gift-cards/KinguinGiftCard";
import { firstValueFrom } from "rxjs";

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
  filteredTransactionsList: Transaction[] = [];
  paginatedTransactions: Transaction[] = []; // Para las transacciones mostradas en la página actual
  transactionProducts: TransactionProduct[] = [];
  productPictures: string[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5; // Cambia el número de elementos por página
  totalPages: number = 0;

  @Input() user: any = {
    email: '',
    name: '',
    phoneNumber: '',
    id: parseInt(<string>sessionStorage.getItem("userId")) | parseInt(<string>localStorage.getItem("userId")),
    role: ''
  };

  searchQuery: string = '';
  selectedStatus: string = '';
  dateFrom: string = '';
  dateTo: string = '';
  private productDetailsCache: Map<number, KinguinGiftCard> = new Map();

  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private transactionService: TransactionsService,
    private kinguinService: KinguinService
  ) { }

  ngOnInit(): void {
    this.loadTransactions();
  }

  async loadTransactions(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {

      const data = await firstValueFrom(this.transactionService.getTransactionsById(this.user.id));

      if (!data || !Array.isArray(data)) {
        console.error('No se recibieron datos válidos para las transacciones.');
        this.errorMessage = 'No se pudieron cargar las transacciones.';
        return;
      }

      // Procesar cada transacción y sus productos
      for (const transaction of data) {
        for (const product of transaction.products) {
          product.image = await this.fetchProductPicture(product.productId);
          product.name = this.productDetailsCache.get(product.productId)?.name;
          product.price = this.productDetailsCache.get(product.productId)?.price;
          this.transactionProducts.push(product);
        }
      }

      this.transactions = data;
      this.filteredTransactionsList = [...this.transactions]; // Inicialmente, todas las transacciones
      this.updatePagination();
    } catch (error) {
      this.errorMessage = 'Ocurrió un error al cargar las transacciones.';
      console.error('Error al cargar las transacciones:', error);
    } finally {
      this.isLoading = false;
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

  /**
   * Actualiza la lista de transacciones filtradas y recalcula la paginación.
   */
  updateFilteredTransactions(): void {
    this.filteredTransactionsList = this.transactions.filter(transaction => {
      const matchesSearchQuery = this.searchQuery ?
        transaction.transactionNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        transaction.products.some(product =>
          product.name?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          product.price?.toString().includes(this.searchQuery.toLowerCase())
        )
        : true;

      const matchesStatus = this.selectedStatus ? transaction.status === this.selectedStatus : true;

      const matchesDateFrom = this.dateFrom ? new Date(transaction.timestamp) >= new Date(this.dateFrom) : true;

      const matchesDateTo = this.dateTo ? new Date(transaction.timestamp) <= new Date(this.dateTo) : true;

      return matchesSearchQuery && matchesStatus && matchesDateFrom && matchesDateTo;
    });

    this.currentPage = 1; // Resetear a la primera página al aplicar filtros
    this.updatePagination();
  }

  /**
   * Actualiza la paginación basada en la lista filtrada.
   */
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredTransactionsList.length / this.itemsPerPage);
    this.updatePaginatedTransactions();
  }

  /**
   * Actualiza las transacciones mostradas en la página actual.
   */
  updatePaginatedTransactions(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTransactions = this.filteredTransactionsList.slice(startIndex, endIndex);
  }

  /**
   * Genera una lista de números de página alrededor de la página actual para la paginación.
   * @returns Array de números de página.
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5; // Número máximo de páginas a mostrar en la paginación
    let startPage = Math.max(this.currentPage - 2, 1);
    let endPage = Math.min(startPage + maxPagesToShow - 1, this.totalPages);

    // Ajustar el inicio si no hay suficientes páginas al final
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(endPage - maxPagesToShow + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Navega a la página especificada.
   * @param page Número de página a la que navegar.
   */
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaginatedTransactions();
  }

  /**
   * Navega a la página anterior.
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedTransactions();
    }
  }

  /**
   * Navega a la página siguiente.
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedTransactions();
    }
  }

  /**
   * Filtra las transacciones basadas en los criterios seleccionados.
   */
  filterTransactions(): void {
    this.updateFilteredTransactions();
  }

  /**
   * Resetea los filtros aplicados.
   */
  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.updateFilteredTransactions();
  }

  /**
   * Maneja los cambios en el input de búsqueda.
   */
  onSearchChange(): void {
    this.updateFilteredTransactions();
  }

  /**
   * Maneja los cambios en los filtros de fecha y estado.
   */
  onFilterChange(): void {
    this.updateFilteredTransactions();
  }

  viewOrderDetails(order: Order): void {

  }

  trackShipment(order: Order): void {

  }

  reorder(order: Order): void {

  }
}
