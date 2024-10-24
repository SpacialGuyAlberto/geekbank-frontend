// src/app/purchase-confirmation/purchase-confirmation.component.ts
import { Component, OnInit } from '@angular/core';
import { TransactionsService } from '../transactions.service';
import {Transaction, TransactionProduct} from '../models/transaction.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RecommendationsService } from "../services/recommendations.service";
import { KinguinGiftCard } from "../models/KinguinGiftCard";
import { AuthService } from "../auth.service";
import {KinguinService} from "../kinguin.service";
import {firstValueFrom} from "rxjs";

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
  transactionProducts: TransactionProduct[] = [];


  // Filtros
  searchQuery: string = '';
  // Paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Transacción reciente
  recentTransaction: Transaction | null = null;
  private productDetailsCache: Map<number, KinguinGiftCard> = new Map();

  constructor(
    private transactionsService: TransactionsService,
    private route: ActivatedRoute,
    private router: Router,
    private recommendationsService: RecommendationsService,
    private authService: AuthService,
    private kinguinService: KinguinService
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      const transactionNumber = params['transactionNumber'];
      if (transactionNumber) {
        this.fetchTransactionByNumber(transactionNumber);
      } else {
        this.errorMessage = "Transaccion no encontradda";
      }
    });

    const userId = this.getCurrentUserId(); // Implementa este método
    this.fetchRecommendations(userId);
  }



  getCurrentUserId(): number {
    const userIdStr = sessionStorage.getItem('userId');
    if (userIdStr !== null) {
      const userId = parseInt(userIdStr);
      if (!isNaN(userId)) {
        return userId;
      }
    }
    return 1; // Valor por defecto si no se puede obtener el userId
  }
  /**
   * Obtiene una transacción específica por su transactionNumber
   */
  fetchTransactionByNumber(transactionNumber: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.transactionsService.getTransactionByNumber(transactionNumber).subscribe(
      async (transaction: Transaction) => {
        for (const product of transaction.products) {
          product.image = await this.fetchProductPicture(product.productId);
          product.name = this.productDetailsCache.get(product.productId)?.name;
          product.price = this.productDetailsCache.get(product.productId)?.price;
          this.transactionProducts.push(product);
        }
        this.recentTransaction = transaction;
        this.totalPages = 1;
        this.isLoading = false;
        console.log(transaction);
      },
      (error) => {
        console.error('Error al obtener la transacción:', error);
        this.errorMessage = 'Error al cargar la transacción.';
        this.isLoading = false;
      }
    );
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


  // **Nuevas Funcionalidades para Recomendaciones**
  recommendedGiftCards: KinguinGiftCard[] = [];

  /**
   * Obtener recomendaciones de compras
   */
  fetchRecommendations(userId: number): void {
    const isLogged = this.isLoggedIn();
    if (isLogged) {
      this.recommendationsService.getRecommendationsByUser(userId).subscribe(
        (data: KinguinGiftCard[]) => {
          this.recommendedGiftCards = data.map(card => {
            card.coverImageOriginal = card.images.cover?.thumbnail || '';
            card.coverImage = card.images.cover?.thumbnail || '';
            return card;
          });
        },
        error => {
          console.error('Error al obtener las recomendaciones:', error);
          // Opcional: Manejar el error, por ejemplo, cargar recomendaciones populares
          this.loadPopularRecommendations();
        }
      );
    } else {
      this.loadPopularRecommendations();
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  /**
   * Cargar recomendaciones populares si el usuario no está autenticado o hay un error
   */
  loadPopularRecommendations(): void {
    this.recommendationsService.getMostPopular(4).subscribe(
      (data: KinguinGiftCard[]) => {
        this.recommendedGiftCards = data.map(card => {
          card.coverImageOriginal = card.images.cover?.thumbnail || '';
          card.coverImage = card.images.cover?.thumbnail || '';
          return card;
        });
      },
      (error) => {
        console.error('Error al cargar recomendaciones populares:', error);
      }
    );
  }

  /**
   * Navegar al detalle del producto
   */
  viewDetails(card: KinguinGiftCard): void {
    console.log('CARD ID: ' + card.productId);
    this.router.navigate(['/gift-card-details', card.kinguinId]).then(success => {
      if (success) {
        console.log('Navigation successful');
      } else {
        console.log('Navigation failed');
      }
    });
  }
}
