import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KinguinGiftCard } from "../models/KinguinGiftCard";
import { KinguinService } from "../kinguin.service";
import { PaginationComponent } from "../pagination/pagination.component";
import { Router } from '@angular/router';
import { FormsModule } from "@angular/forms";
import { SearchBarComponent } from "../search-bar/search-bar.component";
import { HighlightsComponent } from "../highlights/highlights.component";
import { RecommendationsComponent } from "../recommendations/recommendations.component";
import { FiltersComponent } from "../filters/filters.component";
import { CurrencyService } from "../currency.service";
import {Observable, Subscription} from "rxjs";
import { UIStateServiceService } from "../uistate-service.service";
import { AuthService } from "../auth.service";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { WishItemWithGiftcard } from "../models/WishItem";
import { NotificationService } from "../services/notification.service";
import {MainScreenGiftCardService} from "../main-screen-gift-card-service.service";

import {Store} from "@ngrx/store";
import {loadGiftCards, loadGiftCardsFailure, loadGiftCardDetails, loadGiftCardDetailsFailure, loadGiftCardDetailsSuccess, loadGiftCardsPage
        , loadGiftCardsPageFailure, loadGiftCardsPageSuccess, loadGiftCardsSuccess
} from "./store/gift-card.actions";
import {selectAllGiftCards, selectGiftCardsLoading} from "./store/gift-card.selector";


@Component({
  selector: 'app-kinguin-gift-cards',
  templateUrl: './kinguin-gift-cards.component.html',
  standalone: true,
  styleUrls: ['./kinguin-gift-cards.component.css'],
  imports: [
    CommonModule,
    PaginationComponent,
    FormsModule,
    SearchBarComponent,
    HighlightsComponent,
    RecommendationsComponent,
    FiltersComponent,
    MatSnackBarModule
  ]
})
export class KinguinGiftCardsComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() giftCardsInput: KinguinGiftCard[] | null = null; // Renombrado para evitar conflicto

  giftCards: KinguinGiftCard[] = [];
  displayedGiftCards: KinguinGiftCard[] = [];
  currentPage: number = 1;
  cards$!: Observable<KinguinGiftCard[]>
  exchangeRate: number = 0; // Tasa de cambio actualizada
  totalPages: number = 3309;
  itemsPerPage: number = 5;
  currentIndex: number = 0;
  displayedLimit: number = 10;
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
    private mainGiftCards: MainScreenGiftCardService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private store: Store
  ) { }

  ngOnInit(): void {
    if (this.giftCardsInput && this.giftCardsInput.length > 0) {
      this.giftCards = this.giftCardsInput;
      this.displayedGiftCards = this.giftCards.slice(0, this.itemsPerPage);
      this.currentIndex = this.itemsPerPage;
    } else {
      /// this.fetchGiftCards();
    }

    // this.store.dispatch(loadGiftCards());
    // this.cards$ = this.store.select(selectAllGiftCards);
    this.uiStateService.showHighlights$.subscribe(show => {
      if (show){
        this.fetchMainGiftCard();




      }
    });
    this.fetchCurrencyExchange();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['giftCardsInput']) {
      const newGiftCards = changes['giftCardsInput'].currentValue;
      if (newGiftCards && newGiftCards.length > 0) {
        this.giftCards = newGiftCards;
        this.displayedGiftCards = this.giftCards.slice(0, this.itemsPerPage);
        this.currentIndex = this.itemsPerPage;
        this.cd.detectChanges();
      } else {
        // Si giftCardsInput está vacío, recuperar datos predeterminados
        this.fetchGiftCards();
      }
    }
  }

  fetchMainGiftCard(): void {
    this.mainGiftCards.getMainScreenGiftCardItems().subscribe( (data) => {
      data.map( card => {

        card.giftcard.coverImageOriginal =
          card.giftcard.coverImageOriginal ||
          card.giftcard.images.cover?.thumbnail ||
          card.giftcard.coverImage,
            card.giftcard.coverImage =
        card.giftcard.images.cover?.thumbnail || '',

        // card.giftcard.coverImage = card.giftcard.images.cover?.thumbnail || '';
        card.giftcard.randomDiscount = this.generatePersistentDiscount(card.giftcard.name);
        this.giftCards.push(card.giftcard)
        console.log(this.giftCards)
        this.displayGiftCards();
        // this.displayedGiftCards.push(card.giftcard);
        return card;
      })
    });
  }

  displayGiftCards(): void {
    this.displayedGiftCards = this.giftCards.slice(0, this.itemsPerPage);
    console.log(this.displayedGiftCards);
    this.currentIndex = this.itemsPerPage;
  }

  fetchGiftCards(): void {
    this.kinguinService.getGiftCardsModel().subscribe((data: KinguinGiftCard[]) => {
      this.giftCards = data.map(card => {

        card.coverImageOriginal = card.coverImageOriginal ||
          card.images.cover?.thumbnail ||
          card.coverImage
        // Asignar un descuento persistente a cada tarjeta
        card.randomDiscount = this.generatePersistentDiscount(card.name);
        return card;
      });
      this.displayedGiftCards = this.giftCards.slice(0, this.itemsPerPage);
      this.currentIndex = this.itemsPerPage;
      this.cd.detectChanges();
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  loadGiftCards(page: number): void {
    this.kinguinService.getKinguinGiftCards(page).subscribe((data: KinguinGiftCard[]) => {
      this.giftCards = data.map(card => {
        // if (card.coverImageOriginal == ''){
        //   card.coverImageOriginal = card.images.cover.thumbnail;
        //   if (card.images.cover.thumbnail == ''){
        //     card.coverImageOriginal = card.coverImage
        //   }
        // }
        card.coverImageOriginal = card.coverImageOriginal ||
        card.images.cover?.thumbnail ||
        card.coverImage
        // card.coverImageOriginal = card.images.cover?.thumbnail || '';
        // card.coverImage = card.images.cover?.thumbnail || '';
        return card;
      });

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

  generatePersistentDiscount(cardName: string): number {
    // Crea un "hash" simple basado en el nombre de la tarjeta
    let hash = 0;
    for (let i = 0; i < cardName.length; i++) {
      hash = (hash << 5) - hash + cardName.charCodeAt(i);
      hash = hash & hash; // Convertir a 32 bits
    }

    // Genera un número aleatorio consistente entre 15 y 40 basado en el hash
    const random = Math.abs(hash % 26) + 15; // Rango: [15, 40]
    return random;
  }

  ngAfterViewInit(): void {
    this.displayedGiftCards.map(item => {
      item.wished = true;
    })
  }
}
