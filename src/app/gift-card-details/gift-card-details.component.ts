// src/app/gift-card-details/gift-card-details.component.ts
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { KinguinService } from "../kinguin-gift-cards/kinguin.service";
import { KinguinGiftCard, Screenshot, SystemRequirement } from "../kinguin-gift-cards/KinguinGiftCard";
import { CurrencyPipe, ViewportScroller } from "@angular/common";
import { CommonModule } from "@angular/common";
import { Router } from '@angular/router';
import { CartService } from '../cart/cart.service';
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { BackgroundAnimationService } from "../services/background-animation.service";
import { CurrencyService } from "../services/currency.service";
import { FormsModule, NgForm } from "@angular/forms";
import { AuthService } from "../services/auth.service";
import { NotificationService } from "../services/notification.service";
import { FeedbackService } from "../services/feedback.service";
import { Feedback } from "../feedback-list/Feedback";
import { WishListService } from "../user-details/settings/wishlist/wish-list.service";
import { HttpClient } from '@angular/common/http';
import { BannerComponent } from "../banner/banner.component";
import { SuggestionsComponent } from "../suggestions/suggestions.component";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { of, Subscription, combineLatest } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { PaymentOptionsComponent } from "../payment-options/payment-options.component";
import { TigoPaymentComponent } from "../tigo-payment/tigo-payment.component";
import { PaymentComponent } from "../payment/payment.component";
import { WishItemWithGiftcard } from "../user-details/WishItem";
import { ActivationDetails } from "../activation/activation-details.service";
import { ActivationDetailsService } from "../activation/activation-details.service";

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
    BannerComponent,
    SuggestionsComponent,
    MatProgressSpinnerModule,
    PaymentOptionsComponent,
    TigoPaymentComponent,
    PaymentComponent
  ],
  templateUrl: './gift-card-details.component.html',
  styleUrls: ['./gift-card-details.component.css']
})
export class GiftCardDetailsComponent implements OnInit, AfterViewInit {

  displayedActivationDetails: string = ''; // Nueva variable
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
  private isTigoPaymentModalOpen: boolean = false;
  protected activationVideoUrl: string | null = '';
  private activationTextDetails: string | null = '';

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
    private viewPortScroller: ViewportScroller
  ) { }

  @HostListener('window:load', ['$event'])
  onLoad(event: Event) {
    console.log('Evento window:load detectado');
    const productId = localStorage.getItem('productId'); // Recuperar el valor
    if (productId) { // Validar que no sea null
      this.checkIfInCart(parseInt(productId, 10));
      console.log('CHeking if im cart')
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
          console.log(`Gift Card ID: ${this.kinguinId}`);
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

          // Verificar la longitud de los detalles de activación
          if (this.giftCard.activationDetails.length < 4) {
            this.fetchActivationDetails(this.giftCard);
          } else {
            this.displayedActivationDetails = this.giftCard.activationDetails;
          }

        } else {
          console.error('No se recibió ningún dato de la tarjeta de regalo.');
        }
        this.suggestionLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar los detalles de la tarjeta de regalo:', error);
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
    // O, si prefieres usar window.scrollTo:
    // window.scrollTo(0, 0);
  }

  private checkIfInWishlist(kinguinId: number): void {
    this.wishListService.isItemInWishList(kinguinId).subscribe(isInWishlist => {
      if (this.giftCard) {
        this.giftCard.wished = isInWishlist;
        console.log(`Estado de wishlist para ${kinguinId}: ${isInWishlist}`);
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
          console.log(`Item encontrado en el carrito: ${JSON.stringify(itemInCart)}`);
        } else {
          this.isInCart = false;
          this.quantityInCart = 0;
          console.log('Item no encontrado en el carrito.');
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
      if (this.giftCard.images.screenshots.length > 0) {
        this.images = this.giftCard.images.screenshots.map(screenshot => screenshot.url);
        this.currentImage = this.images[this.currentImageIndex];
      } else {
        this.images = [this.giftCard.coverImageOriginal];
        this.currentImage = this.images[0];
      }
      console.log('Detalles de la tarjeta de regalo procesados:', this.giftCard);
    }
  }

  private loadGiftCardLanguages(): void {
    this.http.get<Language[]>('https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/index.json')
      .subscribe((data) => {
        this.languagesData = data;
        this.filterGiftCardLanguages();
        this.suggestionLoading = false;
      }, error => {
        console.error('Error al cargar los datos de idiomas:', error);
        this.suggestionLoading = false;
      });
  }

  private filterGiftCardLanguages() {
    if (!this.giftCard) return;
    this.giftCardLanguages = this.giftCard.languages
      .map(language => this.languageToCountryMap[language])
      .filter(code => code) // Filtrar códigos no definidos
      .map(code => this.languagesData.find(language => language.code === code))
      .filter(country => country !== undefined) as Language[];
  }

  fetchCurrencyExchange(): void {
    this.isLoading = true;
    this.conversionError = '';

    this.currencyService.getExchangeRateEURtoHNL(1).subscribe(
      (convertedAmount: number) => {
        console.log('Tasa de cambio (1 EUR):', convertedAmount);
        this.exchangeRate = convertedAmount;
        this.isLoading = false;
        // Mostrar notificación de éxito
        this.snackBar.open('Tasa de cambio actualizada.', 'Cerrar', {
          duration: 3000,
        });
        if (this.giftCard) {
          this.calculateConvertedPrice();
        }
      },
      (error) => {
        console.error('Error al obtener la tasa de cambio:', error);
        this.conversionError = 'Error al obtener la tasa de cambio.';
        this.isLoading = false;
        this.snackBar.open('Error al obtener la tasa de cambio.', 'Cerrar', {
          duration: 3000,
        });
      }
    );
  }

  fetchActivationDetails(product: KinguinGiftCard) {
    this.activationDetailsService.getDetails(product.kinguinId).subscribe({
      next: (details: ActivationDetails) => {
        // Asignar los detalles obtenidos a la variable para mostrar
        this.displayedActivationDetails = details.textDetails || 'Detalles de activación no disponibles.';

        // Asignar la URL del video si está disponible
        this.activationVideoUrl = details.videoUrl || '';
      },
      error: (err) => {
        // Manejar el error y asignar un mensaje por defecto
        this.displayedActivationDetails = 'No se pudieron cargar los detalles de activación adicionales.';
        this.activationVideoUrl = '';
        console.error('Error al obtener detalles de activación:', err);
      }
    });
  }

  calculateConvertedPrice(): void {
    if (this.giftCard && this.exchangeRate) {
      this.convertedPrice = parseFloat((this.giftCard.price * this.exchangeRate).toFixed(2));
    }
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

    const userId = sessionStorage.getItem('userId'); // Asumiendo que tienes un método para obtener el ID del usuario
    if (!userId) {
      this.snackBar.open('Debes estar autenticado para enviar feedback.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    const feedback: Partial<Feedback> = {
      score: this.feedbackScore,
      message: this.feedbackMessage.trim(),
      userId: userId, // Ahora es string
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
        console.error('Error al enviar feedback:', error);
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
      // Busca el elemento en la lista de deseos
      const element = this.wishedItems.find(item => item.giftCard.kinguinId === giftCard.kinguinId);

      if (!element) {
        console.error(`Error: No se encontró el elemento con KinguinId ${giftCard.kinguinId} en la lista de deseos.`);
        this.showSnackBar('Hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.');
        return;
      }

      console.log(`Eliminando el elemento de la wishlist: ID ${element.wishedItem.id}`);
      this.wishListService.removeWishItem(element.wishedItem.id).subscribe(() => {
        giftCard.wished = false;
        this.showSnackBar('Producto eliminado de la lista de deseos.');
        this.loadWishedItems(); // Actualiza la lista de deseos
      }, error => {
        console.error('Error al eliminar el producto de la wishlist:', error);
        this.showSnackBar('Hubo un error al eliminar el producto de la lista de deseos.');
      });
    } else {
      this.wishListService.addWishItem(giftCard.kinguinId, giftCard.price).subscribe(() => {
        giftCard.wished = true;
        this.showSnackBar(`Producto agregado a la lista de deseos: ${giftCard.name}`);
        this.loadWishedItems(); // Actualiza la lista de deseos
      }, error => {
        console.error('Error al agregar el producto a la wishlist:', error);
        this.showSnackBar('Hubo un error al agregar el producto a la lista de deseos.');
      });
    }
  }

  // Cargar la lista de deseos
  private loadWishedItems(): void {
    this.wishListService.getWishItems().subscribe(
      data => {
        this.wishedItems = data;
        console.log('Lista de deseos cargada:', this.wishedItems);
      },
      error => {
        console.error('Error al cargar los ítems de la lista de deseos:', error);
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
        console.error('Error al eliminar del carrito:', error);
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
        console.error('Error al agregar al carrito:', error);
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

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }

  openFeedbackModal(): void {
    this.isFeedbackModalOpen = true;
  }

  closeFeedbackModal(): void {
    this.isFeedbackModalOpen = false;
    this.feedbackMessage = '';
    this.feedbackScore = 0;
  }

  getTotalPrice(): number {
    return this.giftCard ? parseFloat((this.giftCard.price).toFixed(2)) : 0;
  }

  buyNow(giftCard: KinguinGiftCard): void {
    this.showSnackBar('Funcionalidad "Comprar ahora" en desarrollo.');
  }

  goBack(): void {
    this.router.navigate(['/home']);
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

  openPaymentModal() {
    this.isPaymentModalOpen = true;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  closePaymentModal() {
    this.isPaymentModalOpen = false;
  }

  onPaymentSelected(method: string) {
    this.closePaymentModal();
    if (method === 'Tigo Money') {
      this.isTigoPaymentModalOpen = true;
    }
    console.log(`Método de pago seleccionado: ${method}`);
  }

  checkIfInCart(kinguinId: number) {
    this.cartService.isItemInCart(this.kinguinId).subscribe(isInCart => {
      if (isInCart) {
        this.isInCart = isInCart
        console.log(`El producto con ID ${this.kinguinId} está en el carrito.`);
      } else {
        console.log(`El producto con ID ${this.kinguinId} NO está en el carrito.`);
        this.isInCart = false;
      }
    });
  }
}
