import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KinguinGiftCard } from "./KinguinGiftCard";
import { KinguinService } from "./kinguin.service";
import {NavigationEnd, Router} from '@angular/router';
import { FormsModule } from "@angular/forms";
import { CurrencyService } from "../services/currency.service";
import {async, forkJoin, of, Subscription} from "rxjs";
import { UIStateServiceService } from "../services/uistate-service.service";
import { AuthService } from "../services/auth.service";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MainScreenGiftCardService } from "../main-screen-gift-card-config/main-screen-gift-card-service.service";
import { Store } from "@ngrx/store";
import { MainScreenGiftCardItemDTO } from "../main-screen-gift-card-config/MainScreenGiftCardItem";
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SharedService} from "../services/shared.service";
import {DeeplService} from "../deepl.service";
import {PricingService} from "../pricing/pricing.service";
import {catchError, filter, map, switchMap, tap} from "rxjs/operators";
import {ConvertToHnlPipe} from "../pipes/convert-to-hnl.pipe";
import {DisplayPersistentDiscount} from "../pipes/calculate-displayed-discount.pipe";


@Component({
  selector: 'app-kinguin-gift-cards',
  templateUrl: './kinguin-gift-cards.component.html',
  standalone: true,
  styleUrls: ['./kinguin-gift-cards.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    MatPaginator,
    ConvertToHnlPipe,
    DisplayPersistentDiscount,
  ],
  encapsulation: ViewEncapsulation.None
})
export class KinguinGiftCardsComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() giftCardsInput: KinguinGiftCard[] | null = null; // Renombrado para evitar conflicto
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('mainPaginator') mainPaginator!: MatPaginator;

  giftCards: KinguinGiftCard[] = [];
  isLoading: boolean = false;
  displayedGiftCards: KinguinGiftCard[] = [];
  currentPage: number = 1;
  exchangeRate: number = 0;
  totalPages: number = 0;
  itemsPerPage: number = 14;
  totalItems: number = 0;
  isSearchMode: boolean = false;
  hasMoreItems: boolean = true;
  private giftCardsSubscription!: Subscription;

  currentPageMain: number = 0;
  pageSizeMain: number = 14;
  totalItemsMain: number = 0;
  totalPagesMain: number = 0;

  private isShearch: Subscription | null = null;
  private translatedText: string = '';

  private navSub!: Subscription;

  constructor(
    private authService: AuthService,
    private kinguinService: KinguinService,
    private router: Router,
    private currencyService: CurrencyService,
    private deepl: DeeplService,
    private cd: ChangeDetectorRef,
    private uiStateService: UIStateServiceService,
    private mainGiftCards: MainScreenGiftCardService,
    private pricingService: PricingService,
    private snackBar: MatSnackBar,
    private store: Store,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.isShearch = this.sharedService.isSearchMode$.subscribe(value => {
      this.isSearchMode = value;
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

fetchMainGiftCard(page: number = 0, size: number = 14): void {
    this.isLoading = true;
    this.mainGiftCards.getMainScreenGiftCardItems(page, size).subscribe(
      async (res: any) => {
        try {
          let content: MainScreenGiftCardItemDTO[] = [];

          if (Array.isArray(res)) {
            content = res;
            this.totalItemsMain = content.length;
            this.totalPagesMain = 1;
            this.currentPageMain = 0;
          } else if (res && Array.isArray(res.content)) {
            content = res.content;
            this.currentPageMain = res.number; // 0-based
            this.pageSizeMain = res.size;
            this.totalPagesMain = res.totalPages;
            this.totalItemsMain = res.totalElements ?? content.length;
          }

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

              gc.randomDiscount = this.pricingService.generatePersistentDiscount(gc.name);
              return gc;
            })
          );

          this.giftCards = newGiftCards;
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
          card.randomDiscount = this.pricingService.generatePersistentDiscount(card.name);
          card.priceHNL = this.pricingService.calculateConvertedPrice(card.price, this.exchangeRate)
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
        this.isLoading = false;
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


  viewDetails(card: KinguinGiftCard): void {
    this.router.navigate(['/gift-card-details', card.kinguinId]).then(success => {});
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
    this.navSub?.unsubscribe();
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

  ngAfterViewInit(): void {
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
    this.pageSizeMain = 14;
    this.totalPagesMain = 0;
    this.hasMoreItems = true;
  }

  resetSearch(): void {
    this.currentPage = 1;
    this.totalItems = this.giftCards.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.updateDisplayedGiftCards();
  }

  translate(text: string): string {
    let translation = "";
    this.deepl.translateText(text, 'DE').subscribe(
      (response) => {
        translation= response.translations[0].text;
      },
      (error) => {
        console.error('Error en la traducción:', error);
      }
    );
    console.log(translation)
    return translation;
  }
}

