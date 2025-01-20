import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KinguinGiftCard } from "../models/KinguinGiftCard";
import { KinguinService } from "../kinguin.service";
import { Router } from '@angular/router';
import { FormsModule } from "@angular/forms";
import { SearchBarComponent } from "../search-bar/search-bar.component";
import { HighlightsComponent } from "../highlights/highlights.component";
import { RecommendationsComponent } from "../recommendations/recommendations.component";
import { FiltersComponent } from "../filters/filters.component";
import { CurrencyService } from "../currency.service";
import { Subscription } from "rxjs";
import { UIStateServiceService } from "../uistate-service.service";
import { AuthService } from "../auth.service";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MainScreenGiftCardService } from "../main-screen-gift-card-service.service";
import { Store } from "@ngrx/store";
import { loadGiftCards } from "./store/gift-card.actions";
import { selectAllGiftCards, selectGiftCardsLoading } from "./store/gift-card.selector";
import { MainScreenGiftCardItemDTO } from "../models/MainScreenGiftCardItem";
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SharedService} from "../shared.service";


@Component({
  selector: 'app-kinguin-gift-cards',
  templateUrl: './kinguin-gift-cards.component.html',
  standalone: true,
  styleUrls: ['./kinguin-gift-cards.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    SearchBarComponent,
    HighlightsComponent,
    RecommendationsComponent,
    FiltersComponent,
    MatSnackBarModule,
    MatPaginator,
    // Asegúrate de importar MatPaginatorModule en tu módulo principal si no estás usando `standalone`
  ],
  encapsulation: ViewEncapsulation.None
})
export class KinguinGiftCardsComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() giftCardsInput: KinguinGiftCard[] | null = null; // Renombrado para evitar conflicto
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('mainPaginator') mainPaginator!: MatPaginator;

  giftCards: KinguinGiftCard[] = [];
  isLoading: boolean = false; // Variable para controlar el estado de carga
  displayedGiftCards: KinguinGiftCard[] = [];
  currentPage: number = 1;
  exchangeRate: number = 0; // Tasa de cambio actualizada
  totalPages: number = 0;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  isSearchMode: boolean = false;
  hasMoreItems: boolean = true;
  private giftCardsSubscription!: Subscription;

  currentPageMain: number = 0;
  pageSizeMain: number = 10;
  totalItemsMain: number = 0;
  totalPagesMain: number = 0;
  mainScreenGiftCardItems: MainScreenGiftCardItemDTO[] = [];
  private isShearch: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private kinguinService: KinguinService,
    private router: Router,
    private currencyService: CurrencyService,
    private cd: ChangeDetectorRef,
    private uiStateService: UIStateServiceService,
    private mainGiftCards: MainScreenGiftCardService,
    private snackBar: MatSnackBar,
    private store: Store,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.isShearch = this.sharedService.isSearchMode$.subscribe(value => {
      this.isSearchMode = value;
      console.log('isSearchMode => ', value);
    });

    if (this.giftCardsInput && this.giftCardsInput.length > 0) {
      this.isLoading = true; // Iniciar carga si hay input
      this.giftCards = this.giftCardsInput;
      this.totalItems = this.giftCards.length;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      this.updateDisplayedGiftCards();
      this.isSearchMode = true;
      this.isLoading = false; // Finalizar carga
    } else {
      this.isShearch = this.sharedService.isSearchMode$.subscribe(value => {
        this.isSearchMode = value;
        console.log('isSearchMode => ', value);
      });

      this.fetchGiftCards();
    }

    this.uiStateService.showHighlights$.subscribe(show => {
      if (show) {
        this.fetchMainGiftCard();
        this.isSearchMode = false;
      } else {
        this.isSearchMode = true;
      }
    });

    this.fetchCurrencyExchange();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['giftCardsInput']) {
      this.isLoading = true; // Iniciar carga
      const newGiftCards = changes['giftCardsInput'].currentValue;
      if (newGiftCards && newGiftCards.length > 0) {
        this.giftCards = newGiftCards;
        this.totalItems = this.giftCards.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.currentPage = 1;
        this.updateDisplayedGiftCards();
        this.isSearchMode = true;
        this.isLoading = false; // Finalizar carga
        this.cd.detectChanges();
      } else {
        this.isSearchMode = false;
        this.resetMainPage();
        this.fetchGiftCards();
      }
    }
  }

  fetchMainGiftCard(page: number = 0, size: number = 10): void {
    this.isLoading = true;
    this.mainGiftCards.getMainScreenGiftCardItems(page, size).subscribe(
      async (res: any) => {
        try {
          let content: MainScreenGiftCardItemDTO[] = [];

          // Puede ser un array sin paginación o un objeto con .content
          if (Array.isArray(res)) {
            content = res;
            this.totalItemsMain = content.length;
            this.totalPagesMain = 1;
            this.currentPageMain = 0;
          } else if (res && Array.isArray(res.content)) {
            content = res.content;
            // Ajustamos paginación
            this.currentPageMain = res.number; // 0-based
            this.pageSizeMain = res.size;
            this.totalPagesMain = res.totalPages;
            this.totalItemsMain = res.totalElements ?? content.length;
          }

          // Mapeo de DTO => KinguinGiftCard
          const newGiftCards = await Promise.all(
            content.map(async dto => {
              const gc = dto.giftcard;
              gc.coverImageOriginal =
                gc.coverImageOriginal ||
                gc.images.cover?.thumbnail ||
                gc.coverImage ||
                (await this.getBestImageUrl(gc));

              gc.coverImage =
                gc.images.cover?.thumbnail ||
                gc.coverImage ||
                '';

              gc.randomDiscount = this.generatePersistentDiscount(gc.name);
              return gc;
            })
          );

          // Asignamos la data
          this.giftCards = newGiftCards;
          // En modo principal, el backend ya nos da la página => se muestra tal cual.
          this.displayedGiftCards = this.giftCards;

          this.isLoading = false;
        } catch (error) {
          this.showSnackBar('Error al procesar las gift cards principales.');
          this.isLoading = false;
        }
      },
      () => {
        this.showSnackBar('Error al cargar las gift cards principales.');
        this.isLoading = false;
      }
    );
  }

  onPageChangeMain(event: PageEvent): void {
    this.currentPageMain = event.pageIndex; // 0-based
    this.pageSizeMain = event.pageSize;
    // Pedimos al servidor la página:
    this.fetchMainGiftCard(this.currentPageMain, this.pageSizeMain);
  }

  async getBestImageUrl(card: KinguinGiftCard): Promise<string> {
    const imageUrls: string[] = [];

    if (card.coverImageOriginal) {
      imageUrls.push(card.coverImageOriginal);
    }

    if (card.images.cover?.thumbnail) {
      imageUrls.push(card.images.cover.thumbnail);
    }

    if (card.coverImage) {
      imageUrls.push(card.coverImage);
    }

    if (card.images.screenshots && card.images.screenshots.length > 0) {
      imageUrls.push(...card.images.screenshots.map(screenshot => screenshot.url));
    }

    if (card.screenshots && card.screenshots.length > 0) {
      imageUrls.push(...card.screenshots.map(screenshot => screenshot.url));
    }

    const uniqueImageUrls = Array.from(new Set(imageUrls));

    const promises = uniqueImageUrls.map(url =>
      this.getImageResolution(url)
        .then(res => ({
          url,
          resolution: res.width * res.height,
        }))
        .catch(err => {
          return { url, resolution: 0 };
        })
    );

    const results = await Promise.all(promises);

    const validImages = results
      .filter(img => img.resolution > 0)
      .sort((a, b) => b.resolution - a.resolution);

    return validImages.length > 0 ? validImages[0].url : '';
  }

  getImageResolution(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
    });
  }

  async fetchGiftCards(): Promise<void> {
    this.isLoading = true; // Iniciar la carga
    this.kinguinService.getGiftCardsModel().subscribe(async (data: KinguinGiftCard[]) => {
      try {
        const updatedCardsPromises = data.map(async card => {
          if (!card.coverImageOriginal) {
            card.coverImageOriginal = await this.getBestImageUrl(card);
          }
          card.randomDiscount = this.generatePersistentDiscount(card.name);
          return card;
        });

        this.giftCards = await Promise.all(updatedCardsPromises);
        this.totalItems = this.giftCards.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.currentPage = 1;
        this.updateDisplayedGiftCards();
        this.isLoading = false; // Finalizar la carga
        this.cd.detectChanges();
      } catch (error) {
        this.showSnackBar('Error al procesar las gift cards.');
        this.isLoading = false; // Finalizar la carga en caso de error
      }
    }, error => {
      this.showSnackBar('Error al cargar las gift cards.');
      this.isLoading = false; // Finalizar la carga en caso de error
    });
  }

  updateDisplayedGiftCards(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedGiftCards = this.giftCards.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.itemsPerPage = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.updateDisplayedGiftCards();
  }

  loadMore(): void {
    if (this.currentPageMain < this.totalPagesMain - 1) {
      const nextPage = this.currentPageMain + 1;
      this.isLoading = true; // Iniciar la carga
      this.mainGiftCards.getMainScreenGiftCardItems(nextPage, this.pageSizeMain).subscribe(
        async (response) => {
          try {
            this.currentPageMain = response.number;
            this.totalPagesMain = response.totalPages;

            // Procesar las gift cards de manera asíncrona
            const newGiftCards = await Promise.all(
              response.content.map(async (dto) => {
                const giftCard = dto.giftcard;

                // Ajustar imágenes de la gift card
                giftCard.coverImageOriginal =
                  giftCard.coverImageOriginal ||
                  giftCard.images.cover?.thumbnail ||
                  giftCard.coverImage ||
                  (await this.getBestImageUrl(giftCard));

                giftCard.coverImage =
                  giftCard.images.cover?.thumbnail || giftCard.coverImage || '';

                // Generar un descuento aleatorio
                giftCard.randomDiscount = this.generatePersistentDiscount(giftCard.name);

                return giftCard;
              })
            );

            // Concatena las nuevas gift cards con las existentes
            this.giftCards = [...this.giftCards, ...newGiftCards];
            this.displayedGiftCards = this.giftCards;
            this.isLoading = false; // Finalizar la carga
          } catch (error) {
            this.showSnackBar('Error al procesar las gift cards.');
            this.isLoading = false; // Finalizar la carga en caso de error
          }
        },
        (error) => {
          this.showSnackBar('Error al cargar más gift cards.');
          this.isLoading = false; // Finalizar la carga en caso de error
        }
      );
    } else {
      this.showSnackBar('No hay más elementos que cargar');
    }
  }

  viewDetails(card: KinguinGiftCard): void {
    this.router.navigate(['/gift-card-details', card.kinguinId]).then(success => {
      if (success) {

      } else {

      }
    });
  }

  fetchCurrencyExchange(): void {
    this.currencyService.getExchangeRateEURtoHNL(1).subscribe(
      (convertedAmount: number) => {
        this.exchangeRate = convertedAmount;
      },
      (error) => {
        this.snackBar.open('Error al obtener la tasa de cambio.', 'Cerrar', {
          duration: 3000,
        });
      }
    );
  }

  ngOnDestroy(): void {
    if (this.giftCardsSubscription) {
      this.giftCardsSubscription.unsubscribe();
    }
    this.isSearchMode = false;
  }

  showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
    });
  }

  generatePersistentDiscount(cardName: string): number {
    let hash = 0;
    for (let i = 0; i < cardName.length; i++) {
      hash = (hash << 5) - hash + cardName.charCodeAt(i);
      hash = hash & hash;
    }

    const random = Math.abs(hash % 26) + 15;
    return random;
  }

  ngAfterViewInit(): void {
    // Marca todas las giftCards como deseadas después de la inicialización de la vista
    this.displayedGiftCards.forEach(item => {
      item.wished = true;
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  resetMainPage(): void {
    this.giftCards = [];
    this.displayedGiftCards = [];
    this.currentPageMain = 0;
    this.pageSizeMain = 10;
    this.totalPagesMain = 0;
    this.hasMoreItems = true;
  }

  resetSearch(): void {
    this.currentPage = 1;
    this.totalItems = this.giftCards.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.updateDisplayedGiftCards();
  }
}

