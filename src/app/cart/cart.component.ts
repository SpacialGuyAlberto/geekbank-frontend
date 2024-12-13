// cart.component.ts
import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import { CartService } from '../cart.service';
import {DecimalPipe, NgForOf, NgIf} from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { TigoPaymentComponent } from "../tigo-payment/tigo-payment.component";
import { CartItemWithGiftcard } from "../models/CartItem";
import { BackgroundAnimationService } from "../background-animation.service";
import { CurrencyService } from "../currency.service";
import { FormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from "../auth.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import { RandomKeyMostSoldComponent } from "../random-key-most-sold/random-key-most-sold.component";
import { RecommendationsComponent } from "../recommendations/recommendations.component";
import { PayPalButtonComponent } from "../paypal-button/paypal-button.component";
import { Subject, takeUntil } from "rxjs";
import { CART_ITEMS, TOTAL_PRICE, PRODUCT_ID, GAME_USER_ID, IS_MANUAL_TRANSACTION } from "../payment/payment.token";
import { OrderRequest } from "../models/order-request.model";
import {GuestService} from "../guest.service";
import {User} from "../models/User";


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
  exchangeRate: number = 0;
  showDialog: boolean = false;
  protected showPaymentModal: boolean = false;
  cartItemCount: number = 0;
  isLoading: boolean = false;
  totalPriceEUR: number = 0;
  conversionError: string = '';
  userId: number | null = null;
  user: User | null = null;
  showPaypalPaymentModal: boolean = false;
  totalAmountString: string | null = '';
  private destroy$ = new Subject<void>();
  showCardButton: boolean = false;
  showPayPalButton: boolean = false;

  isEmailPromptComplete: boolean = false;
  showEmailPrompt: boolean = false;
  wantsEmailKey: boolean = false;
  wantsSMSKey: boolean = false;
  emailForKey: string = '';

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
  orderDetails?: OrderRequest;
  selectedOption: string | null = null;

  constructor(
    private cartService: CartService,
    private guestService: GuestService,
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
    console.log('USER ID : ' + this.userId);

    this.cartService.cartItemCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.cartItemCount = count;
      });

    if (this.authService.isLoggedIn()) {
      const storedUserId = sessionStorage.getItem("userId");
      this.authService.getUserDetails().subscribe(data => {
        this.user = data;
        this.userEmail = data.email;
      });
      if (storedUserId) {
        this.userId = parseInt(storedUserId, 10);
        if (isNaN(this.userId)) {
          this.userId = null;
        }
      } else {
        this.userId = null;
      }
    } else {
      this.guestId = this.guestService.getGuestId();
    }
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
        console.log("Loaded cart items: ", this.cartItems);
        this.updateCartItemCount();
        this.calculateTotalPriceEUR();
        this.totalAmountString = this.totalPriceEUR.toString();
      });
  }

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
    if (this.cartItems.length === 0) {
      this.snackBar.open('No hay items en el carrito.', 'Cerrar', { duration: 3000 });
      return;
    }

    const phoneNumber = this.paymentDetails.phoneNumber;
    let orderDetails: OrderRequest | undefined;

    // Lógica para crear orderDetails sin exigir refNumber ni isEmailPromptComplete aún
    if (this.productId !== null) {
      // Caso: Se tiene productId específico
      orderDetails = {
        userId: this.userId ? Number(this.userId) : null,
        guestId: this.guestId || null,
        email: this.emailForKey || '',
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
      // Caso: Usuario autenticado con userId
      if (this.cartItems && this.cartItems.length > 0) {
        // Carrito con ítems
        orderDetails = {
          userId: this.userId ? Number(this.userId) : null,
          guestId: this.guestId || null,
          phoneNumber: phoneNumber,
          email: this.emailForKey || '',
          products: this.cartItems.map(item => ({
            kinguinId: item.cartItem.productId!,
            qty: item.cartItem.quantity,
            price: item.giftcard.price,
            name: 'Producto'
          })),
          amount: this.cartItems.reduce((total, item) => total + (item.giftcard.price * item.cartItem.quantity), 0),
          manual: this.isManualTransaction,
          sendKeyToSMS: this.wantsSMSKey,
          gameUserId: this.gameUserId || undefined
        };
      } else {
        // Carrito vacío, usar balance u otro
        orderDetails = {
          userId: this.userId ? Number(this.userId) : null,
          guestId: this.guestId || null,
          phoneNumber: phoneNumber,
          email: this.emailForKey || '',
          products: [{
            kinguinId: -1,
            qty: 1,
            price: this.totalPrice,
            name: 'Balance'
          }],
          amount: this.totalPrice,
          manual: this.isManualTransaction,
          sendKeyToSMS: this.wantsSMSKey,
          gameUserId: this.gameUserId || undefined
        };
      }
    } else if (this.guestId) {
      // Caso: Usuario invitado
      if (this.cartItems && this.cartItems.length > 0) {
        orderDetails = {
          guestId: this.guestId,
          phoneNumber: phoneNumber,
          email: this.emailForKey || '',
          products: this.cartItems.map(item => ({
            kinguinId: item.cartItem.productId,
            qty: item.cartItem.quantity,
            price: item.giftcard.price,
            name: 'Producto'
          })),
          amount: this.cartItems.reduce((total, item) => total + (item.giftcard.price * item.cartItem.quantity), 0),
          manual: this.isManualTransaction,
          sendKeyToSMS: this.wantsSMSKey,
          gameUserId: this.gameUserId || undefined
        };
      } else {
        orderDetails = {
          guestId: this.guestId,
          phoneNumber: phoneNumber,
          email: this.emailForKey || '',
          products: [{
            kinguinId: -1,
            qty: 1,
            price: this.totalPrice,
            name: 'Balance'
          }],
          amount: this.totalPrice,
          manual: this.isManualTransaction,
          sendKeyToSMS: this.wantsSMSKey,
          gameUserId: this.gameUserId || undefined
        };
      }
    } else {
      this.snackBar.open('No se pudo crear la orden: No hay información de usuario o invitado.', 'Cerrar', { duration: 3000 });
      return;
    }

    if (!orderDetails) {
      this.snackBar.open('No se pudo crear el OrderRequest.', 'Cerrar', { duration: 3000 });
      return;
    }

    console.log("DETALLES DE ORDEN:", orderDetails);
    this.orderDetails = orderDetails;

    // Dependiendo de la opción seleccionada, mostrar el botón correspondiente:
    if (this.selectedOption === 'paypal') {
      // PayPal: usamos la orden tal cual está
      this.selectedOption = null;
      this.showPayPalButton = true;
    } else if (this.selectedOption === 'card') {
      // Card: usamos la misma orden
      this.selectedOption = null;
      this.showCardButton = true;
    } else if (this.selectedOption === 'TIGO MONEY') {
      // Tigo: Aquí NO necesitamos refNumber todavía.
      // El componente Tigo preguntará por el refNumber y luego actualizará la orden.
      this.selectedOption = null;
      this.showPaymentModal = true;
    } else {
      console.log('No se ha seleccionado ninguna opción.');
    }
  }


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
      this.loadCartItems();
    });
  }

  removeAllCartItems(): void {
    this.cartService.removeAllCartItems().subscribe(() => {
      this.loadCartItems();
    });
  }

  incrementProductQuantity(item: CartItemWithGiftcard): void {
    const newQuantity = item.cartItem.quantity + 1;
    this.cartService.updateCartItem(item.cartItem.productId, newQuantity).subscribe(() => {
      item.cartItem.quantity = newQuantity;
      this.updateCartItemCount();
      this.calculateTotalPriceEUR();
    });
  }

  decreaseProductQuantity(item: CartItemWithGiftcard): void {
    if (item.cartItem.quantity > 1) {
      const newQuantity = item.cartItem.quantity - 1;
      this.cartService.updateCartItem(item.cartItem.productId, newQuantity).subscribe(() => {
        item.cartItem.quantity = newQuantity;
        this.updateCartItemCount();
        this.calculateTotalPriceEUR();
      });
    } else {
      this.cartService.removeCartItem(item.cartItem.productId).subscribe(() => {
        this.cartItems = this.cartItems.filter(cartItem => cartItem.cartItem.productId !== item.cartItem.productId);
        this.updateCartItemCount();
        this.showDialog = true;
        setTimeout(() => {
          this.closeDialog();
        }, 3000);
        this.calculateTotalPriceEUR();
      });
    }
  }

  openPaymentModal(): void {
    if (this.cartItems.length === 0) {
      this.snackBar.open('No hay items en el carrito.', 'Cerrar', {
        duration: 3000,
      });
      return;
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

  async submitOrder(): Promise<OrderRequest> {
    if (!this.manualVerificationData.refNumber) {
      this.manualVerificationError = 'Por favor, ingrese el número de referencia.';
      throw new Error('No reference number provided');
    }

    if (!this.isEmailPromptComplete) {
      this.showEmailPrompt = true;
      throw new Error('Email prompt not complete');
    }

    const phoneNumber = this.paymentDetails.phoneNumber;
    let orderDetails: OrderRequest | undefined;



    if (this.productId !== null) {
      orderDetails = {
        userId: this.userId ? Number(this.userId) : null,
        guestId: this.guestId || null,
        email: this.wantsEmailKey ? (this.userEmail || this.emailForKey || '') : '',
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
          email: this.emailForKey || '',

          products: this.cartItems.map(item => ({
            kinguinId: item.cartItem.productId!,
            qty: item.cartItem.quantity,
            price: item.giftcard.price,
            name: 'Producto'
          })),
          amount: this.cartItems.reduce((total, item) => total + item.giftcard.price * item.cartItem.quantity, 0),
          manual: this.isManualTransaction,
          sendKeyToSMS: this.wantsSMSKey,
          gameUserId: this.gameUserId || undefined
        };
      } else {
        orderDetails = {
          userId: this.userId ? Number(this.userId) : null,
          guestId: this.guestId || null,
          phoneNumber: phoneNumber,
          email: this.emailForKey || '',
          products: [{
            kinguinId: -1,
            qty: 1,
            price: this.totalPrice,
            name: 'Balance'
          }],
          amount: this.totalPrice,
          manual: this.isManualTransaction,
          sendKeyToSMS: this.wantsSMSKey,
          gameUserId: this.gameUserId || undefined
        };
      }
    }
    else if (this.guestId) {
      if (this.cartItems && this.cartItems.length > 0) {
        orderDetails = {
          guestId: this.guestId,
          phoneNumber: phoneNumber,
          email: this.emailForKey || '',
          products: this.cartItems.map(item => ({
            kinguinId: item.cartItem.productId,
            qty: item.cartItem.quantity,
            price: item.giftcard.price,
            name: 'Producto'
          })),
          amount: this.cartItems.reduce((total, item) => total + item.giftcard.price * item.cartItem.quantity, 0),
          manual: this.isManualTransaction,
          sendKeyToSMS: this.wantsSMSKey,
          gameUserId: this.gameUserId || undefined
        };
      } else {
        orderDetails = {
          guestId: this.guestId,
          phoneNumber: phoneNumber,
          email: this.emailForKey || '',
          products: [{
            kinguinId: -1,
            qty: 1,
            price: this.totalPrice,
            name: 'Balance'
          }],
          amount: this.totalPrice,
          manual: this.isManualTransaction,
          sendKeyToSMS: this.wantsSMSKey,
          gameUserId: this.gameUserId || undefined
        };
      }
    } else {
      throw new Error('No user or guest information available to create order');
    }

    if (!orderDetails) {
      throw new Error('No se pudo crear el OrderRequest.');
    }

    console.log("DETALLES DE ORDEN", orderDetails);
    return orderDetails;
  }

  onPaymentSuccess(transactionNumber: string) {
    this.router.navigate(['/purchase-confirmation'], {
      queryParams: { transactionNumber: transactionNumber }
    });
  }

  protected readonly Number = Number;
}

