// src/app/gift-card-details/gift-card-details.component.ts
import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import { KinguinService } from "../kinguin.service";
import {KinguinGiftCard, Screenshot, SystemRequirement} from "../models/KinguinGiftCard";
import { CurrencyPipe } from "@angular/common";
import { CommonModule } from "@angular/common";
import { Router } from '@angular/router';
import { CartService } from '../cart.service';
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { BackgroundAnimationService } from "../background-animation.service";
import { CurrencyService } from "../currency.service";
import { FormsModule, NgForm } from "@angular/forms";
import { AuthService } from "../auth.service";
import { NotificationService } from "../services/notification.service";
import { FeedbackService } from "../services/feedback.service";
import { Feedback } from "../models/Feedback";
import { WishListService } from "../wish-list.service";
import { HttpClient } from '@angular/common/http';
import {BannerComponent} from "../banner/banner.component";
import {SuggestionsComponent} from "../suggestions/suggestions.component";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {of, Subscription} from "rxjs";
import {switchMap} from "rxjs/operators";


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
    MatProgressSpinnerModule

  ],
  templateUrl: './gift-card-details.component.html',
  styleUrls: ['./gift-card-details.component.css']
})
export class GiftCardDetailsComponent implements OnInit {

  suggestionLoading: boolean = false;
  giftCard: KinguinGiftCard | undefined;
  activeTab: string = 'description';
  isInCart: boolean = false;
  kinguinId: number = 0;
  cartItemCount: number = 0;
  exchangeRate: number = 0; // Tasa de cambio actualizada
  convertedPrice: number = 0; // Precio convertido a HNL
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
  systemRequirements: SystemRequirement[] | null= null;

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
    // Añade más mapeos según sea necesario
  };

  constructor(
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
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.suggestionLoading = true;
    this.fetchCurrencyExchange();
    // const id = this.route.snapshot.paramMap.get('id');

    this.routeSub = this.route.paramMap.pipe(

      switchMap((params: ParamMap) => {
        const id = params.get('id');
        if (id){
          this.suggestionLoading = true;
          return this.kinguinService.getGiftCardDetails(id)
        } else {
          return of (null)
        }
      })
    ).subscribe(data => {
      if (data){
        data.coverImageOriginal = data.images.cover?.thumbnail || '';
        data.coverImage = data.images.cover?.thumbnail || '';
        this.giftCard = data;
        this.kinguinId = data.kinguinId;
        if (this.giftCard.images.screenshots.length > 0){
          this.giftCard.images.screenshots.map( screenshot => this.images.push(screenshot.url));
          this.currentImage = this.images[this.currentImageIndex];
          console.log(this.images)
        } else {
          this.images = [this.giftCard.coverImageOriginal]
          this.currentImage = this.images[0];
        }
        this.checkIfInCart(data.kinguinId);
        this.http.get<Language[]>('https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/index.json')
          .subscribe((data) => {
            this.languagesData = data;
            this.filterGiftCardLanguages();
            this.suggestionLoading = false;
          });
        this.cdr.markForCheck();
      }
    })
    this.cartService.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;
      this.cartItemCountChange.emit(this.cartItemCount);
    });
  }

  private filterGiftCardLanguages() {
    // Filtrar los países específicos de la gift card usando el mapeo de idiomas
    this.giftCardLanguages = this.giftCard?.languages
      .map(language => this.languageToCountryMap[language])
      .filter(code => code) // Filtrar códigos no definidos
      .map(code => this.languagesData.find(language => language.code === code))
      .filter(country => country !== undefined) as Language[];
  }

  /**
   * Obtiene la tasa de cambio de EUR a HNL.
   */
  fetchCurrencyExchange(): void {
    this.isLoading = true;
    this.conversionError = '';

    // Obtener la tasa de cambio para 1 EUR a HNL
    this.currencyService.getExchangeRateEURtoHNL(1).subscribe(
      (convertedAmount: number) => {
        console.log('Exchange Rate (1 EUR):', convertedAmount);
        this.exchangeRate = convertedAmount;
        this.isLoading = false;
        // Mostrar notificación de éxito
        this.snackBar.open('Tasa de cambio actualizada.', 'Cerrar', {
          duration: 3000,
        });
        // Actualizar el precio convertido si el giftCard ya está cargado
        if (this.giftCard) {
          this.calculateConvertedPrice();
        }
      },
      (error) => {
        console.error('Error al obtener la tasa de cambio:', error);
        this.conversionError = 'Error al obtener la tasa de cambio.';
        this.isLoading = false;
        // Mostrar notificación de error
        this.snackBar.open('Error al obtener la tasa de cambio.', 'Cerrar', {
          duration: 3000,
        });
      }
    );
  }

  /**
   * Calcula el precio convertido a HNL.
   */
  calculateConvertedPrice(): void {
    if (this.giftCard && this.exchangeRate) {
      this.convertedPrice = parseFloat((this.giftCard.price * this.exchangeRate).toFixed(2));
    }
  }

  /**
   * Maneja el envío de feedback.
   */
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
      userId: sessionStorage.getItem('userId'), // Ahora es string
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
    return this.authService.isLoggedIn();
  }

  /**
   * Verifica si el ítem está en el carrito.
   */
  checkIfInCart(kinguinId: number): void {
    this.cartService.isItemInCart(kinguinId).subscribe(isInCart => {
      this.isInCart = isInCart;
      console.log(`isInCart is now: ${this.isInCart}`);
      if (this.isInCart) {
        this.cartService.getCartItems().subscribe(cartItems => {
          const itemInCart = cartItems.find(item => item.cartItem.productId === kinguinId);
          if (itemInCart) {
            this.quantityInCart = itemInCart.cartItem.quantity;
            console.log(`Item found in cart: ${JSON.stringify(itemInCart)}`);
          }
          this.emitCartItemCount();
        });
      } else {
        this.quantityInCart = 0;
        console.log('Item not found in cart.');
        this.emitCartItemCount();
      }
    });
  }

  /**
   * Alterna la inclusión en la wishlist.
   */
  toggleWishList(giftCard: KinguinGiftCard, event: MouseEvent): void {
    event.stopPropagation(); // Prevenir que el click propague al viewDetails

    if (!this.isLoggedIn()) {
      this.showSnackBar('You are not logged in. Please log in to add items to your wishlist.');
      return;
    }

    if (giftCard.wished) {
      this.wishListService.removeWishItem(giftCard.kinguinId).subscribe(() => {
        giftCard.wished = false; // Actualiza el estado de la tarjeta específica
        this.showSnackBar('Product removed from wishlist.');
      });
    } else {
      this.wishListService.addWishItem(giftCard.kinguinId, giftCard.price).subscribe(() => {
        giftCard.wished = true; // Actualiza el estado de la tarjeta específica
        this.showSnackBar('Product added to wishlist: ' + giftCard.name);
      });
    }
  }

  /**
   * Alterna la inclusión en el carrito.
   */
  toggleCart(giftCard: KinguinGiftCard): void {
    if (this.isInCart) {
      this.cartService.removeCartItem(giftCard.kinguinId).subscribe(() => {
        this.isInCart = false;
        this.quantityInCart = 0;
        this.emitCartItemCount();
        this.notifMessage = `You removed ${giftCard.name} from cart.`;
        this.notificationService.addNotification(this.notifMessage, giftCard.coverImage);
        this.showSnackBar('Product removed from cart');
      });
    } else {
      this.cartService.addCartItem(giftCard.kinguinId, 1, giftCard.price).subscribe(() => {
        this.isInCart = true;
        this.quantityInCart = 1;
        this.emitCartItemCount();
        this.notifMessage = `You added ${giftCard.name} to cart.`;
        this.showSnackBar('Product added to cart: ' + giftCard.kinguinId);
        this.notificationService.addNotification(this.notifMessage, giftCard.coverImage);
      });
    }
  }

  /**
   * Emite el conteo actualizado de ítems en el carrito.
   */
  emitCartItemCount(): void {
    this.cartService.getCartItems().subscribe(cartItems => {
      const totalCount = cartItems.reduce((total, item) => total + item.cartItem.quantity, 0);
      this.cartService.updateCartItemCountManual(totalCount);
    });
  }

  /**
   * Muestra una notificación tipo snackBar.
   */
  showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }

  /**
   * Redirecciona al usuario a la página de login.
   */
  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Maneja la apertura del modal de feedback.
   */
  openFeedbackModal(): void {
    this.isFeedbackModalOpen = true;
  }

  /**
   * Cierra el modal de feedback.
   */
  closeFeedbackModal(): void {
    this.isFeedbackModalOpen = false;
    this.feedbackMessage = '';
  }

  /**
   * Obtiene el precio total en EUR.
   */
  getTotalPrice(): number {
    return this.giftCard ? parseFloat((this.giftCard.price).toFixed(2)) : 0;
  }

  /**
   * Compra ahora (Funcionalidad a implementar).
   */
  buyNow(giftCard: KinguinGiftCard): void {
    // Implementa la funcionalidad de compra ahora
  }

  /**
   * Regresa a la página anterior.
   */
  goBack(): void {
    this.router.navigate(['/home']);
  }

  nextImage(): void {
    if (this.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
      this.currentImage = this.images[this.currentImageIndex];
    }
  }
  //
  // /**
  //  * Cambia a la imagen anterior en el carrusel.
  //  */
  previousImage(): void {
    if (this.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
      this.currentImage = this.images[this.currentImageIndex];
    }
  }
  //
  // selectImage(index: number): void {
  //   if (index >= 0 && index < this.images.length) {
  //     this.currentImageIndex = index;
  //     this.currentImage = this.images[index];
  //   }
  // }
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

}
