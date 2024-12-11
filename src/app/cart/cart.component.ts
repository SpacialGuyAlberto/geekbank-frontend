// src/app/cart/cart.component.ts
import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import { CartService } from '../cart.service';
import {DecimalPipe, NgForOf, NgIf} from "@angular/common";
import { KinguinGiftCard } from "../models/KinguinGiftCard";
import {Router, RouterLink} from "@angular/router";
import { TigoPaymentComponent } from "../tigo-payment/tigo-payment.component";
import { CartItemWithGiftcard } from "../models/CartItem";
import { BackgroundAnimationService } from "../background-animation.service";
import { CurrencyService } from "../currency.service";
import { FormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from "../auth.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import {RandomKeyMostSoldComponent} from "../random-key-most-sold/random-key-most-sold.component";
import {RecommendationsComponent} from "../recommendations/recommendations.component";
import {PayPalButtonComponent} from "../paypal-button/paypal-button.component";
import {Subject, takeUntil} from "rxjs";
import { CART_ITEMS, TOTAL_PRICE, PRODUCT_ID, GAME_USER_ID, IS_MANUAL_TRANSACTION } from "../payment/payment.token";
import {OrderRequest} from "../models/order-request.model";


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    RouterLink,
    TigoPaymentComponent,
    FormsModule,
    MatIcon,
    RandomKeyMostSoldComponent,
    RecommendationsComponent,
    PayPalButtonComponent,
    DecimalPipe
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  providers: [
    {
      provide: CART_ITEMS,
      useFactory: (component: CartComponent) => component.cartItems,
      deps: [CartComponent]
    },
    {
      provide: TOTAL_PRICE,
      useFactory: (component: CartComponent) => component.getTotalPrice(),
      deps: [CartComponent]
    },
    {
      provide: PRODUCT_ID,
      useValue: null
    },
    {
      provide: GAME_USER_ID,
      useValue: null
    },
    {
      provide: IS_MANUAL_TRANSACTION,
      useValue: false
    }
  ]
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItemWithGiftcard[] = [];
  exchangeRate: number = 0; // Tasa de cambio HNL por 1 EUR
  showDialog: boolean = false;
  protected showPaymentModal: boolean = false;
  cartItemCount: number = 0;
  isLoading: boolean = false;
  totalPriceEUR: number = 0; // Total en EUR
  conversionError: string = '';
  userId: string | null = null;
  showPaypalPaymentModal: boolean = false;
  totalAmountString: string | null = '';
  private destroy$ = new Subject<void>();
  showPayPalButton: boolean = false; // Nueva bandera para PayPal

  isEmailPromptComplete: boolean = false;
  showEmailPrompt: boolean = false;
  wantsEmailKey: boolean = false;
  wantsSMSKey: boolean = false;
  emailForKey?: string;
  userEmail?: string;
  paymentDetails = { phoneNumber: '' };
  guestId?: string | null = '';
  totalPrice: number = 0;
  isManualTransaction = false;
  gameUserId?: number;
  manualVerificationData = { refNumber: '' };
  manualVerificationError?: string;
  showSpinner: boolean = false;
  private productId: number | null = null;
  // Almacenar orderDetails una vez creados
  orderDetails?: OrderRequest;

  selectedOption: string | null = null;


  constructor(
    private cartService: CartService,
    private animation: BackgroundAnimationService,
    private currencyService: CurrencyService,
    private dialog: MatDialog,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  private router: Router

) {}

  @HostListener('window:load', ['$event'])
  onLoad(event: Event) {
    console.log('Evento window:load detectado');
    this.loadCartItems();
    this.countCartItems();
  }

  ngOnInit(): void {
    this.loadCartItems();
    this.userId = sessionStorage.getItem('userId');
    console.log('USER ID : ' + this.userId);

    this.cartService.cartItemCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.cartItemCount = count;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCartItems(): void {
    this.cartService.loadCartItems();

    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.cartItems = items;
        console.log("Loaded cart items: ", this.cartItems); // Añadir este log
        this.updateCartItemCount();
        this.calculateTotalPriceEUR();
        this.totalAmountString = this.totalPriceEUR.toString();
      });
  }
  /**
   * Calcula el precio total en EUR.
   */
  calculateTotalPriceEUR(): void {
    let total = this.cartItems.reduce((sum, item) => sum + item.cartItem.quantity * item.giftcard.price, 0);
    this.totalPriceEUR = parseFloat(total.toFixed(2));
    this.getExchangeRate();
  }

  selectOption(option: string): void {
    this.selectedOption = option;
    console.log('Opción seleccionada:', option);
  }

  continueWithOption(): void {
    if (this.selectedOption == "TIGO MONEY") {
      console.log('Procesando la opción seleccionada:', this.selectedOption);
      this.selectedOption = null; // Reinicia la selección después de procesar
      this.showPaymentModal = true; // Mostrar modal de TIGO
    } else if (this.selectedOption == "PayPal") {
      console.log('Procesando la opción seleccionada:', this.selectedOption);
      this.selectedOption = null; // Reinicia la selección después de procesar
      this.showPayPalButton = true; // Mostrar botón de PayPal
    } else {
      console.log('No se ha seleccionado ninguna opción.');
    }
  }




  /**
   * Obtiene la tasa de cambio EUR a HNL.
   */
  getExchangeRate(): void {
    this.isLoading = true;
    this.conversionError = '';

    this.currencyService.getExchangeRateEURtoHNL(this.totalPriceEUR).subscribe(
      (rate: number) => {
        console.log('Exchange Rate (HNL per EUR):', rate);
        this.exchangeRate = rate;
        this.isLoading = false;
        this.snackBar.open('Tasa de cambio obtenida exitosamente.', 'Cerrar', {
          duration: 3000,
        });
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

  removeCartItem(productId: number): void {
    console.log('Removing item with ID: ' + productId);
    this.cartService.removeCartItem(productId).subscribe(() => {
      this.loadCartItems(); // Recargar los elementos después de la eliminación
    });
  }

  removeAllCartItems(): void {
    this.cartService.removeAllCartItems().subscribe(() => {
      this.loadCartItems(); // Recargar los elementos después de la eliminación
    });
  }

  incrementProductQuantity(item: CartItemWithGiftcard): void {
    const newQuantity = item.cartItem.quantity + 1;
    this.cartService.updateCartItem(item.cartItem.productId, newQuantity).subscribe(() => {
      item.cartItem.quantity = newQuantity;
      this.updateCartItemCount();
      console.log('Increased quantity:', item);
      this.calculateTotalPriceEUR(); // Actualizar el total en EUR después de cambiar la cantidad
    });
  }

  decreaseProductQuantity(item: CartItemWithGiftcard): void {
    if (item.cartItem.quantity > 1) {
      const newQuantity = item.cartItem.quantity - 1;
      this.cartService.updateCartItem(item.cartItem.productId, newQuantity).subscribe(() => {
        item.cartItem.quantity = newQuantity;
        this.updateCartItemCount();
        console.log('Decreased quantity:', item);
        this.calculateTotalPriceEUR(); // Actualizar el total en EUR después de cambiar la cantidad
      });
    } else {
      // Si la cantidad llega a 0, eliminar el ítem del carrito
      this.cartService.removeCartItem(item.cartItem.productId).subscribe(() => {
        this.cartItems = this.cartItems.filter(cartItem => cartItem.cartItem.productId !== item.cartItem.productId);
        this.updateCartItemCount();
        this.showDialog = true;
        setTimeout(() => {
          this.closeDialog();
        }, 3000);
        console.log('Removed item from cart:', item);
        this.calculateTotalPriceEUR(); // Actualizar el total en EUR después de eliminar el ítem
      });
    }
  }

  openPaymentModal(): void {
    if (this.cartItems.length === 0) {
      this.snackBar.open('No hay items en el carrito.', 'Cerrar', {
        duration: 3000,
      });
      return; // Evitar abrir el modal si no hay items
    }
    this.showPaymentModal = true;
    console.log('Total en HNL:', this.totalPriceEUR * this.exchangeRate);
  }

  closeDialog(): void {
    this.showDialog = false;
  }

  getTotalPrice(): number {
    return this.totalPriceEUR;
  }

  updateCartItemCount(): void {
    this.cartService.updateCartItemCount();
    console.log(this.cartItemCount);
  }

  countCartItems(){
    this.cartService.cartItemCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.cartItemCount = count;
      });
  }

  async submitOrder(): Promise<OrderRequest | null> {
    if (!this.manualVerificationData.refNumber) {
      this.manualVerificationError = 'Por favor, ingrese el número de referencia.';
      return null;
    }

    // Si no hemos completado el prompt de email, lo mostramos
    if (!this.isEmailPromptComplete) {
      this.showEmailPrompt = true;
      return null;
    }

    const phoneNumber = this.paymentDetails.phoneNumber;
    let orderDetails: OrderRequest;

    if (this.productId !== null) {
      orderDetails = {
        userId: this.userId ? Number(this.userId) : null, // Convertimos a número o null
        guestId: this.guestId || null, // Garantizamos que sea string o null
        email: this.wantsEmailKey
          ? (this.userEmail ? this.userEmail : (this.emailForKey || ''))
          : '',
        phoneNumber: phoneNumber,
        products: [{
          kinguinId: this.productId,
          qty: 1,
          price: this.totalPrice,
          name: 'Producto'
        }],
        amount: this.totalPrice,
        manual: this.isManualTransaction,
        sendKeyToSMS: this.wantsSMSKey,
        gameUserId: this.gameUserId || undefined
      };
    } else if (this.authService.isAuthenticated() && this.userId !== null) {
      if (this.cartItems && this.cartItems.length > 0) {
        orderDetails = {
          userId: this.userId ? Number(this.userId) : null,
          guestId: this.guestId || null,
          phoneNumber: phoneNumber,
          email: this.wantsEmailKey
            ? (this.userEmail ? this.userEmail : (this.emailForKey || ''))
            : '',
          products: this.cartItems.map(item => ({
            kinguinId: item.cartItem.productId!, // Forzamos que no sea undefined
            qty: item.cartItem.quantity,
            price: item.giftcard.price,
            name: 'Producto'
          })),
          amount: this.cartItems.reduce((total, item) => total + item.giftcard.price * item.cartItem.quantity, 0),
          manual: this.isManualTransaction,
          sendKeyToSMS: this.wantsSMSKey,
          gameUserId: this.gameUserId || undefined // Opcional
        };
      } else {
        orderDetails = {
          userId: this.userId ? Number(this.userId) : null,
          guestId: this.guestId || null,
          phoneNumber: phoneNumber,
          email: this.wantsEmailKey
            ? (this.userEmail ? this.userEmail : (this.emailForKey || ''))
            : '',
          products: [{
            kinguinId: -1, // Representa "Balance" o un producto genérico
            qty: 1,
            price: this.totalPrice,
            name: 'Balance'
          }],
          amount: this.totalPrice,
          manual: this.isManualTransaction,
          sendKeyToSMS: this.wantsSMSKey,
          gameUserId: this.gameUserId || undefined // Opcional
        };
      }
    }
    else if (this.guestId) {
      if (this.cartItems && this.cartItems.length > 0) {
        orderDetails = {
          guestId: this.guestId,
          phoneNumber: phoneNumber,
          email: this.wantsEmailKey ? this.emailForKey : undefined,
          products: this.cartItems.map(item => ({
            kinguinId: item.cartItem.productId,
            qty: item.cartItem.quantity,
            price: item.giftcard.price,
            name: 'Producto'
          })),
          amount: this.cartItems.reduce((total, item) => total + item.giftcard.price * item.cartItem.quantity, 0),
          manual: this.isManualTransaction,
          sendKeyToSMS: this.wantsSMSKey
        };
        if (this.gameUserId !== null) {
          orderDetails.gameUserId = this.gameUserId;
        }
      } else {
        orderDetails = {
          guestId: this.guestId,
          phoneNumber: phoneNumber,
          email: this.wantsEmailKey
            ? (this.userEmail ? this.userEmail : (this.emailForKey || ''))
            : '',
          products: [{
            kinguinId: -1,
            qty: 1,
            price: this.totalPrice,
            name: 'Balance'
          }],
          amount: this.totalPrice,
          manual: this.isManualTransaction,
          sendKeyToSMS: this.wantsSMSKey
        };
        if (this.gameUserId !== null) {
          orderDetails.gameUserId = this.gameUserId;
        }
      }
    } else {
      this.showSpinner = false;
      return null;
    }

    return orderDetails;
  }

  onPaymentSuccess(transactionNumber: string) {
    this.router.navigate(['/purchase-confirmation'], {
      queryParams: { transactionNumber: transactionNumber }
    });
  }

  protected readonly Number = Number;
}
