// src/app/kinguin-gift-cards/kinguin-gift-cards.component.ts
import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common'; // Importa CommonModule
import {KinguinGiftCard} from "../models/KinguinGiftCard";
import {KinguinService} from "../kinguin.service";
import {PaginationComponent} from "../pagination/pagination.component";
import {Router} from '@angular/router';
import {FormsModule} from "@angular/forms";
import {SearchBarComponent} from "../search-bar/search-bar.component";
import {HighlightsComponent} from "../highlights/highlights.component";
import {RecommendationsComponent} from "../recommendations/recommendations.component";
import {FiltersComponent} from "../filters/filters.component";
import {CurrencyService} from "../currency.service";
import {Subscription} from "rxjs";
import {UIStateServiceService} from "../uistate-service.service";

import {AuthService} from "../auth.service";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {WishItemWithGiftcard} from "../models/WishItem";
import {NotificationService} from "../services/notification.service";

@Component({
  selector: 'app-kinguin-gift-cards',
  templateUrl: './kinguin-gift-cards.component.html',
  standalone: true,
  styleUrls: ['./kinguin-gift-cards.component.css'],
  imports: [CommonModule,
    PaginationComponent,
    FormsModule,
    SearchBarComponent,
    HighlightsComponent,
    RecommendationsComponent,
    FiltersComponent,
    MatSnackBarModule
  ]
})
export class KinguinGiftCardsComponent implements OnInit, AfterViewInit, OnDestroy {
  giftCards: KinguinGiftCard[] = [];
  displayedGiftCards: KinguinGiftCard[] = [];
  currentPage: number = 1;

  exchangeRate: number = 0; // Tasa de cambio actualizada
  totalPages: number = 3309;
  itemsPerPage: number = 8; // Número de tarjetas por carga
  currentIndex: number = 0; // Índice para el 'Load More'
  totalItems: number = 8000;
  isSearching: boolean = false;
  private giftCardsSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private kinguinService: KinguinService,
    private router: Router,
    private currencyService: CurrencyService,
    private cd: ChangeDetectorRef,
    private uiStateService: UIStateServiceService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,

  ) { }

  ngOnInit(): void {
    this.kinguinService.getGiftCardsModel().subscribe((data: KinguinGiftCard[]) => {
      this.giftCards = data;
      this.displayedGiftCards = this.giftCards.slice(0, this.itemsPerPage);
      this.currentIndex = this.itemsPerPage;
      this.cd.detectChanges();
    });

    this.uiStateService.showHighlights$.subscribe(show => {
      if (show){
        this.loadGiftCards(this.currentPage)
      }
    });
    this.fetchCurrencyExchange();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  loadGiftCards(page: number): void {
    // Cargar las tarjetas primero
    this.kinguinService.getKinguinGiftCards(page).subscribe((data: KinguinGiftCard[]) => {
      this.giftCards = data.map(card => {
        card.coverImageOriginal = card.images.cover?.thumbnail || '';
        card.coverImage = card.images.cover?.thumbnail || '';
        // Puedes añadir lógica adicional aquí si es necesario
        return card;
      });

      // Actualizar las tarjetas que se muestran
      this.displayedGiftCards = this.giftCards.slice(0, this.itemsPerPage);
      this.currentIndex = this.itemsPerPage;
    });
  }

  loadMore(): void {
    const nextItems = this.giftCards.slice(this.currentIndex, this.currentIndex + this.itemsPerPage);
    this.displayedGiftCards = [...this.displayedGiftCards, ...nextItems];
    this.currentIndex += this.itemsPerPage;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadGiftCards(this.currentPage);
    }
  }

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

  fetchCurrencyExchange(): void {
    this.currencyService.getExchangeRateEURtoHNL(1).subscribe(
      (convertedAmount: number) => {
        console.log('Exchange Rate (1 EUR):', convertedAmount);
        this.exchangeRate = convertedAmount;
      },
      (error) => {
        console.error('Error al obtener la tasa de cambio:', error);
        this.snackBar.open('Error al obtener la tasa de cambio.', 'Cerrar', {
          duration: 3000,
        });
      }
    );
  }

  ngOnDestroy(): void {
    // Cancela la suscripción cuando el componente se destruye para evitar fugas de memoria
    if (this.giftCardsSubscription) {
      this.giftCardsSubscription.unsubscribe();
    }
  }

  showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }

  ngAfterViewInit(): void {
    this.displayedGiftCards.map( item => {
      // Implementa la lógica para verificar si el ítem está en la wishlist si es necesario
      item.wished = true;
    })
  }
}
