// src/app/purchase-confirmation/purchase-confirmation.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf, NgForOf, CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { Transaction, TransactionProduct } from '../transactions/transaction.model';
import { KinguinGiftCard } from '../kinguin-gift-cards/KinguinGiftCard';

import { TransactionsService } from '../transactions/transactions.service';
import { RecommendationsService } from '../services/recommendations.service';
import { AuthService } from '../services/auth.service';
import { KinguinService } from '../kinguin-gift-cards/kinguin.service';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-purchase-confirmation',
  standalone: true,
  imports: [NgIf, NgForOf, FormsModule, CurrencyPipe, DatePipe, NgClass],
  templateUrl: './purchase-confirmation.component.html',
  styleUrls: ['./purchase-confirmation.component.css']
})
export class PurchaseConfirmationComponent implements OnInit {

  isLoading = false;
  errorMessage = '';

  transactionNumber = '';

  recentTransaction: Transaction | null = null;
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  recommendedGiftCards: KinguinGiftCard[] = [];
  showKeysModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionsService: TransactionsService,
    private recommendationsService: RecommendationsService,
    private authService: AuthService,
    private kinguinService: KinguinService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const qParam = params['transactionNumber'];
      if (qParam) {
        this.transactionNumber = qParam;
        this.fetchTransactionByNumber(qParam);
      }
    });
    const userId = this.getCurrentUserId();
    this.fetchRecommendations(userId);
  }

  handleTransactionSearch(): void {
    if (this.transactionNumber.trim()) {
      this.fetchTransactionByNumber(this.transactionNumber);
    }
  }

  fetchTransactionByNumber(transactionNumber: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.recentTransaction = null;

    this.transactionsService.getTransactionByNumber(transactionNumber).subscribe({
      next: async (transaction: Transaction) => {
        if (!transaction) {
          this.errorMessage = 'No se encontró la transacción con ese número.';
          this.isLoading = false;
          return;
        }

        this.recentTransaction = transaction;

        // Cargar imágenes de productos
        for (const product of this.recentTransaction.products) {
          product.image = await this.fetchProductPicture(product.productId);
        }

        this.isLoading = false;
        // Ajustar la paginación si es necesario
        this.totalPages = 1;
      },
      error: (err) => {
        console.error('Error al obtener la transacción:', err);
        this.errorMessage = 'Error al cargar la transacción.';
        this.isLoading = false;
      }
    });
  }

  async fetchProductPicture(productId: number): Promise<string> {
    try {
      const card = await firstValueFrom(this.kinguinService.getGiftCardDetails(productId.toString()));
      const imageUrl = card.images.cover?.thumbnail || "https://via.placeholder.com/150";
      return imageUrl;
    } catch (error) {
      console.error(`Error al obtener detalles del producto ID ${productId}:`, error);
      return "https://via.placeholder.com/150"; // Imagen por defecto
    }
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
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

  fetchRecommendations(userId: number): void {
    if (this.authService.isLoggedIn()) {
      this.recommendationsService.getRecommendationsByUser(userId).subscribe({
        next: (cards) => {
          this.recommendedGiftCards = cards.map(card => {
            card.coverImage = card.images.cover?.thumbnail || '';
            card.coverImageOriginal = card.coverImage;
            return card;
          });
        },
        error: (err) => {
          console.error('Error al obtener recomendaciones:', err);
          this.loadPopularRecommendations();
        }
      });
    } else {
      this.loadPopularRecommendations();
    }
  }

  loadPopularRecommendations(): void {
    this.recommendationsService.getMostPopular(4).subscribe({
      next: (cards) => {
        this.recommendedGiftCards = cards.map(card => {
          card.coverImage = card.images.cover?.thumbnail || '';
          card.coverImageOriginal = card.coverImage;
          return card;
        });
      },
      error: (err) => {
        console.error('Error al cargar recomendaciones populares:', err);
      }
    });
  }

  viewDetails(card: KinguinGiftCard): void {

    this.router.navigate(['/gift-card-details', card.kinguinId]);
  }

  openKeysModal(): void {
    this.showKeysModal = true;
  }

  closeKeysModal(): void {
    this.showKeysModal = false;
  }

  getCurrentUserId(): number {
    const userIdStr = sessionStorage.getItem('userId');
    if (userIdStr) {
      const userId = parseInt(userIdStr, 10);
      if (!isNaN(userId)) {
        return userId;
      }
    }
    return 1;
  }
}
