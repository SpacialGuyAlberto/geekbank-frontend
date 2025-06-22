
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { KinguinService } from "../kinguin-gift-cards/kinguin.service";
import { KinguinGiftCard, Screenshot, SystemRequirement } from "../kinguin-gift-cards/KinguinGiftCard";
import { CurrencyPipe, ViewportScroller } from "@angular/common";
import { CommonModule } from "@angular/common";
import { Router } from '@angular/router';
import { CartService } from '../cart/cart.service';
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { CurrencyService } from "../services/currency.service";
import { FormsModule, NgForm } from "@angular/forms";
import { AuthService } from "../services/auth.service";
import { NotificationService } from "../services/notification.service";
import { FeedbackService } from "../services/feedback.service";
import { Feedback } from "../feedback-list/Feedback";
import { WishListService } from "../user-details/settings/wishlist/wish-list.service";
import { HttpClient } from '@angular/common/http';
import { SuggestionsComponent } from "../suggestions/suggestions.component";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { of, Subscription, combineLatest } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { WishItemWithGiftcard } from "../user-details/WishItem";
import {ActivationDetails, ActivationDetailsService} from "../activation/activation-details.service";
import {PricingService} from "../pricing/pricing.service";
import {ConvertToHnlPipe} from "../pipes/convert-to-hnl.pipe";

interface Language {
  name: string;
  code: string;
  emoji: string;
  unicode: string;
  image: string;
}

@Component({
  selector: 'app-gift-card-details',
  standalone: true,
  imports: [
    CurrencyPipe,
    CommonModule,
    MatSnackBarModule,
    FormsModule,
    SuggestionsComponent,
    MatProgressSpinnerModule,
    ConvertToHnlPipe,
  ],
  templateUrl: './gift-card-details.component.html',
  styleUrls: ['./gift-card-details.component.css']
})
export class GiftCardDetailsComponent implements OnInit, AfterViewInit {

  displayedActivationDetails: string = '';
  suggestionLoading: boolean = false;
  giftCard: KinguinGiftCard | undefined;
  activeTab: string = 'description';
  isInCart: boolean = false;
  isPaymentModalOpen: boolean = false;
  kinguinId: number = 0;
  productId: string | null = '';
  cartItemCount: number = 0;
  exchangeRate: number = 0;
  convertedPrice: number = 0;
  quantityInCart: number = 0;
  notifMessage: string = '';
  isFeedbackModalOpen: boolean = false;
  feedbackMessage: string = '';
  userId: number = 0;
  languagesData: Language[] = [];
  giftCardLanguages: Language[] = [];
  wished: boolean = false;
  protected feedbackScore: number = 0;
  isLoading: boolean = false;
  conversionError: string = '';
  suggestionFilter: string[] = [];
  systemRequirements: SystemRequirement[] | null = null;
  isManualTransaction: boolean = false;
  wishedItems: WishItemWithGiftcard[] = [];

  @Output() cartItemCountChange: EventEmitter<number> = new EventEmitter<number>();

  currentImageIndex: number = 0;
  images: string[] = [];
  currentImage: Screenshot | string | null = null;
  private routeSub: Subscription = new Subscription();

  languageToCountryMap: { [language: string]: string } = {
    "English": "US",
    "French": "FR",
    "Italian": "IT",
    "German": "DE",
    "Spanish": "ES",
    "Arabic": "AE",
    "Portuguese - Brazil": "BR",
    "Polish": "PL",
    "Russian": "RU",
    "Chinese": "CN",
    "Japanese": "JP",
    "Korean": "KR",
    "Thai": "TH"
  };
  protected activationVideoUrl: string | null = '';
  protected displayedDescription: string | null = '';

  constructor(
    private activationDetailsService: ActivationDetailsService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private kinguinService: KinguinService,
    private router: Router,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private currencyService: CurrencyService,
    private feedbackService: FeedbackService,
    private wishListService: WishListService,
    private http: HttpClient,
    private viewPortScroller: ViewportScroller,
    private pricingService: PricingService,
  ) { }

  @HostListener('window:load', ['$event'])
  onLoad(event: Event) {
    const productId = localStorage.getItem('productId');
    if (productId) {
      this.checkIfInCart(parseInt(productId, 10));
    }
  }

  ngOnInit(): void {
    this.suggestionLoading = true;
    this.fetchCurrencyExchange();

    this.loadWishedItems();
    this.routeSub = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const id = params.get('id');
        if (id) {
          this.kinguinId = parseInt(id, 10);
          localStorage.setItem('productId', id);
          this.productId = id;
          return this.kinguinService.getGiftCardDetails(id);
        } else {
          return of(null);
        }
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          this.giftCard = data;
          this.processGiftCardDetails();
          this.checkIfInCart(data.kinguinId);
          this.waitForCartItemsAndCheck(this.kinguinId);
          this.loadGiftCardLanguages();
          this.checkIfInWishlist(this.giftCard.kinguinId);

        } else {
         return;
        }
        this.suggestionLoading = false;
      },
      error: (error) => {
        this.suggestionLoading = false;
      }
    });

    this.cartService.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;
      this.cartItemCountChange.emit(this.cartItemCount);
    });
  }

  ngAfterViewInit(): void {
    this.viewPortScroller.scrollToPosition([0, 0]);
  }

  private checkIfInWishlist(kinguinId: number): void {
    this.wishListService.isItemInWishList(kinguinId).subscribe(isInWishlist => {
      if (this.giftCard) {
        this.giftCard.wished = isInWishlist;
      }
    });
  }

  private waitForCartItemsAndCheck(kinguinId: number): void {
    combineLatest([this.cartService.cartItems$, of(kinguinId)]).pipe(
      map(([cartItems, id]) => {
        const itemInCart = cartItems.find(item => item.cartItem.productId === id);
        if (itemInCart) {
          this.isInCart = true;
          this.quantityInCart = itemInCart.cartItem.quantity;

        } else {
          this.isInCart = false;
          this.quantityInCart = 0;

        }
      })
    ).subscribe({
      error: (err) => console.error('Error al esperar los ítems del carrito:', err)
    });
  }

  private processGiftCardDetails(): void {
    if (this.giftCard) {
      this.giftCard.coverImageOriginal = this.giftCard.images.cover?.thumbnail || '';
      this.giftCard.coverImage = this.giftCard.images.cover?.thumbnail || '';
      this.displayedDescription = this.giftCard.description;
      this.displayedActivationDetails = this.giftCard.activationDetails;
      if (this.giftCard.images.screenshots.length > 0) {
        this.images = this.giftCard.images.screenshots.map(screenshot => screenshot.url);
        this.currentImage = this.images[this.currentImageIndex];
      } else {
        this.images = [this.giftCard.coverImageOriginal];
        this.currentImage = this.images[0];
      }
      this.kinguinService.getGiftCardInformation(this.giftCard.kinguinId.toString()).subscribe({
        next: (giftcard: KinguinGiftCard) => {
          this.displayedActivationDetails = giftcard.activationDetails || 'Detalles de activación no disponibles.';
          if (this.displayedDescription && this.displayedDescription?.length > 0){
            this.displayedDescription = giftcard.description || 'Descripcion de producto no encontrada.'
          }

          this.activationVideoUrl = '';
        },
        error: (err) => {
          if (this.giftCard)
          this.activationDetailsService.getDetails(this.giftCard.kinguinId).subscribe({
            next: (details: ActivationDetails) => {
              this.displayedActivationDetails = details.textDetails || 'Contacte a nuestro servicio al cliente para los servicios de activacion.';
            }
          })
        }
      });
    }
  }

  private loadGiftCardLanguages(): void {
    this.http.get<Language[]>('https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/index.json')
      .subscribe((data) => {
        this.languagesData = data;
        this.filterGiftCardLanguages();
        this.suggestionLoading = false;
      }, error => {

        this.suggestionLoading = false;
      });
  }

  private filterGiftCardLanguages() {
    if (!this.giftCard) return;
    this.giftCardLanguages = this.giftCard.languages
      .map(language => this.languageToCountryMap[language])
      .filter(code => code)
      .map(code => this.languagesData.find(language => language.code === code))
      .filter(country => country !== undefined) as Language[];
  }

  fetchCurrencyExchange(): void {
    this.isLoading = true;
    this.conversionError = '';

    this.currencyService.getExchangeRateEURtoHNL(1).subscribe(
      (convertedAmount: number) => {
        this.exchangeRate = convertedAmount;
        this.isLoading = false;

        this.snackBar.open('Tasa de cambio actualizada.', 'Cerrar', {
          duration: 3000,
        });
        if (this.giftCard) {
          this.convertedPrice = this.pricingService.calculateConvertedPrice(this.giftCard.price, this.exchangeRate)
        }
      },
      (error) => {
        this.conversionError = 'Error al obtener la tasa de cambio.';
        this.isLoading = false;
        this.snackBar.open('Error al obtener la tasa de cambio.', 'Cerrar', {
          duration: 3000,
        });
      }
    );
  }


  submitFeedback(form: NgForm): void {
    if (!form.valid) {
      this.snackBar.open('Por favor, completa todos los campos requeridos.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    if (!this.giftCard) {
      this.snackBar.open('No se ha seleccionado ninguna tarjeta de regalo.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      this.snackBar.open('Debes estar autenticado para enviar feedback.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    const feedback: Partial<Feedback> = {
      score: this.feedbackScore,
      message: this.feedbackMessage.trim(),
      userId: userId,
      giftCardId: this.giftCard.kinguinId.toString(),
      createdAt: new Date()
    };

    this.feedbackService.createFeedback(feedback).subscribe({
      next: (response) => {
        this.snackBar.open('¡Gracias por tu feedback!', 'Cerrar', {
          duration: 3000,
        });
        this.closeFeedbackModal();
      },
      error: (error) => {
        this.snackBar.open('Hubo un error al enviar tu feedback. Por favor, intenta de nuevo.', 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  toggleWishList(giftCard: KinguinGiftCard, event: MouseEvent): void {
    event.stopPropagation();

    if (!this.isLoggedIn()) {
      this.showSnackBar('No estás logueado. Por favor, inicia sesión para administrar tu lista de deseos.');
      return;
    }

    if (giftCard.wished) {
      const element = this.wishedItems.find(item => item.giftCard.kinguinId === giftCard.kinguinId);

      if (!element) {
        this.showSnackBar('Hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.');
        return;
      }

      this.wishListService.removeWishItem(element.wishedItem.id).subscribe(() => {
        giftCard.wished = false;
        this.showSnackBar('Producto eliminado de la lista de deseos.');
        this.loadWishedItems();
      }, error => {
        this.showSnackBar('Hubo un error al eliminar el producto de la lista de deseos.');
      });
    } else {
      this.wishListService.addWishItem(giftCard.kinguinId, giftCard.price).subscribe(() => {
        giftCard.wished = true;
        this.showSnackBar(`Producto agregado a la lista de deseos: ${giftCard.name}`);
        this.loadWishedItems();
      }, error => {
        this.showSnackBar('Hubo un error al agregar el producto a la lista de deseos.');
      });
    }
  }

  private loadWishedItems(): void {
    this.wishListService.getWishItems().subscribe(
      data => {
        this.wishedItems = data;
      },
      error => {
      }
    );
  }

  toggleCart(giftCard: KinguinGiftCard): void {
    if (this.isInCart) {
      this.cartService.removeCartItem(giftCard.kinguinId).subscribe(() => {
        this.isInCart = false;
        this.quantityInCart = 0;
        this.emitCartItemCount();
        this.notifMessage = `Has eliminado ${giftCard.name} del carrito.`;
        this.notificationService.addNotification(this.notifMessage, giftCard.coverImage);
        this.showSnackBar('Producto eliminado del carrito.');
      }, error => {
        this.showSnackBar('Hubo un error al eliminar el producto del carrito.');
      });
    } else {
      this.cartService.addCartItem(giftCard.kinguinId, 1, giftCard.priceHNL).subscribe(() => {
        this.isInCart = true;
        this.quantityInCart = 1;
        this.emitCartItemCount();
        this.notifMessage = `Has agregado ${giftCard.name} al carrito.`;
        this.showSnackBar(`Producto agregado al carrito: ${giftCard.name}. Cuyo precio es: ${giftCard.priceHNL}`);
        this.notificationService.addNotification(this.notifMessage, giftCard.coverImage);
      }, error => {
        this.showSnackBar('Hubo un error al agregar el producto al carrito.');
      });
    }
  }

  emitCartItemCount(): void {
    this.cartService.updateCartItemCount();
  }

  showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
    });
  }

  openFeedbackModal(): void {
    this.isFeedbackModalOpen = true;
  }

  closeFeedbackModal(): void {
    this.isFeedbackModalOpen = false;
    this.feedbackMessage = '';
    this.feedbackScore = 0;
  }


  nextImage(): void {
    if (this.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
      this.currentImage = this.images[this.currentImageIndex];
    }
  }

  previousImage(): void {
    if (this.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
      this.currentImage = this.images[this.currentImageIndex];
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  checkIfInCart(kinguinId: number) {
    this.cartService.isItemInCart(this.kinguinId).subscribe(isInCart => {
      if (isInCart) {
        this.isInCart = isInCart
      } else {
        this.isInCart = false;
      }
    });
  }
}
