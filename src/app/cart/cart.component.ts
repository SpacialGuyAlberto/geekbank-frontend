import { AfterViewInit, Component, HostListener, input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DecimalPipe, NgForOf, NgIf } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { FormsModule, NgModel } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, takeUntil, switchMap, of } from "rxjs";

import { CartService } from "./cart.service";
import { CurrencyService } from "../services/currency.service";
import { AuthService } from "../services/auth.service";
import { GuestService } from "../services/guest.service";
import { PromotionsService } from "../promotions/promotions.service";
import { PricingService } from "../pricing/pricing.service";

import { CartItemWithGiftcard } from "./CartItem";
import { User } from "../user-details/User";
import { Promotion } from "../promotions/Promotion.model";
import { OrderRequest } from "../models/order-request.model";

import { TigoPaymentComponent } from "../tigo-payment/tigo-payment.component";
import { CardPaymentComponent } from "../payment/Stripe/card-payment/card-payment.component";
import { SuggestionsComponent } from "../suggestions/suggestions.component";
import { TermsAndConditionsComponent } from "../terms-and-conditions/terms-and-conditions.component";
import { ConvertToHnlPipe } from "../pipes/convert-to-hnl.pipe";

import { CART_ITEMS, TOTAL_PRICE, PRODUCT_ID, GAME_USER_ID, IS_MANUAL_TRANSACTION, PROMO_CODE } from "../payment/payment.token";

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    TigoPaymentComponent,
    FormsModule,
    MatIcon,
    DecimalPipe,
    CardPaymentComponent,
    ConvertToHnlPipe,
    RouterLink,
    SuggestionsComponent,
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  providers: [
    { provide: CART_ITEMS, useFactory: (c: CartComponent) => c.cartItems, deps: [CartComponent] },
    { provide: TOTAL_PRICE, useFactory: (c: CartComponent) => c.getTotalPrice(), deps: [CartComponent] },
    { provide: PRODUCT_ID, useValue: null },
    { provide: GAME_USER_ID, useValue: null },
    { provide: IS_MANUAL_TRANSACTION, useValue: false },
    { provide: PROMO_CODE, useValue: null }
  ]
})
export class CartComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('emailCtrl') emailCtrl!: NgModel;
  protected readonly input = input;
  protected readonly Number = Number;
  private destroy$ = new Subject<void>();

  // ==========================================
  // ESTADO DEL CARRITO Y PRECIOS
  // ==========================================
  cartItems: CartItemWithGiftcard[] = [];
  cartItemCount: number = 0;
  totalEUR: number = 0;
  totalHNL: number = 0;
  totalPrice: number = 0; // Utilizado como fallback
  exchangeRate: number = 1;

  // ==========================================
  // ESTADO DEL USUARIO
  // ==========================================
  user: User | null = null;
  userId: number | null = null;
  guestId: string | null = null;
  userEmail?: string;
  gameUserId?: number;

  // ==========================================
  // ESTADO DEL CHECKOUT Y PAGO
  // ==========================================
  selectedOption: string | null = null;
  orderDetails?: OrderRequest;
  paymentDetails = { phoneNumber: '' };
  isManualTransaction = false;
  manualVerificationData = { refNumber: '' };
  manualVerificationError?: string;
  private productId: number | null = null;

  // Datos de contacto para la compra
  emailForKey: string = '';
  emailRegex = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
  wantsEmailKey: boolean = false;
  wantsSMSKey: boolean = false;

  // Promociones
  promo: Promotion | undefined = undefined;
  promoCode: string = "";
  codeExist: boolean = true;
  codeExistBlueprint: boolean = false;
  discountApplied: boolean = false;
  discountReceived: string = "";

  // ==========================================
  // ESTADO DE LA INTERFAZ (UI FLAGS)
  // ==========================================
  isLoading: boolean = false;
  showSpinner: boolean = false;
  showDialog: boolean = false;
  showPaymentModal: boolean = false;
  showCardButton: boolean = false;
  showPayPalButton: boolean = false;
  showCancelledModal: boolean = false;
  showEmailPrompt: boolean = false;
  isEmailPromptComplete: boolean = false;
  emailErrorMessage: boolean = false;
  conversionError: string = '';

  constructor(
    private cartService: CartService,
    private guestService: GuestService,
    private promotionService: PromotionsService,
    private currencyService: CurrencyService,
    private dialog: MatDialog,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private pricing: PricingService
  ) {}

  @HostListener('window:load')
  onLoad() {
    this.initializeCartData();
  }

  ngOnInit(): void {
    this.initializeCartData();
    this.initializeUser();
  }

  ngAfterViewInit(): void {
    this.recalcTotals();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // MÉTODOS DE INICIALIZACIÓN
  // ==========================================

  private initializeCartData(): void {
    this.loadCartItems();
    this.countCartItems();
    this.initExchangeRate();
  }

  private initializeUser(): void {
    if (this.authService.isLoggedIn()) {
      const storedUserId = sessionStorage.getItem("userId");
      this.userId = storedUserId ? parseInt(storedUserId, 10) : null;
      if (this.userId && isNaN(this.userId)) this.userId = null;

      this.authService.getUserDetails()
        .pipe(takeUntil(this.destroy$))
        .subscribe(data => {
          this.user = data;
          this.userEmail = data.email;
        });
    } else {
      this.guestId = this.guestService.getGuestId();
    }
  }

  private initExchangeRate(): void {
    this.currencyService.getExchangeRateEURtoHNL(1)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async rate => {
        this.exchangeRate = rate;
        await this.recalcTotals();
      });
  }

  // ==========================================
  // LÓGICA DEL CARRITO
  // ==========================================

  loadCartItems(): void {
    this.cartService.loadCartItems();
    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(async items => {
        this.cartItems = items;
        this.updateCartItemCount();
        await this.recalcTotals();
      });
  }

  private async recalcTotals(): Promise<void> {
    const promises = this.cartItems.map(async item => {
      const price = await item.giftcard.price;
      return price * item.cartItem.quantity;
    });

    const converted = await Promise.all(promises);
    this.totalEUR = converted.reduce((sum, price) => sum + price, 0);
    this.totalHNL = await this.pricing.convert(this.totalEUR, this.exchangeRate);

    // Aplicar descuento visual si existe
    if (this.promo && !this.discountApplied) {
      this.applyDiscountMath();
    }
  }

  incrementProductQuantity(item: CartItemWithGiftcard): void {
    const newQuantity = item.cartItem.quantity + 1;
    this.cartService.updateCartItem(item.cartItem.productId, newQuantity).subscribe(() => {
      item.cartItem.quantity = newQuantity;
      this.updateCartItemCount();
      this.recalcTotals();
    });
  }

  decreaseProductQuantity(item: CartItemWithGiftcard): void {
    if (item.cartItem.quantity > 1) {
      const newQuantity = item.cartItem.quantity - 1;
      this.cartService.updateCartItem(item.cartItem.productId, newQuantity).subscribe(() => {
        item.cartItem.quantity = newQuantity;
        this.updateCartItemCount();
        this.recalcTotals();
      });
    } else {
      this.removeCartItem(item.cartItem.productId);
    }
  }

  removeCartItem(productId: number): void {
    this.cartService.removeCartItem(productId).subscribe(() => {
      this.cartItems = this.cartItems.filter(i => i.cartItem.productId !== productId);
      this.updateCartItemCount();
      this.recalcTotals();

      this.showDialog = true;
      setTimeout(() => this.showDialog = false, 3000);
    });
  }

  removeAllCartItems(): void {
    this.cartService.removeAllCartItems().subscribe(() => this.loadCartItems());
  }

  updateCartItemCount(): void {
    this.cartService.updateCartItemCount();
  }

  countCartItems() {
    this.cartService.cartItemCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => this.cartItemCount = count);
  }

  // ==========================================
  // LÓGICA DE CHECKOUT Y ORDEN
  // ==========================================

  selectOption(option: string): void {
    this.selectedOption = option;
  }

  continueWithOption(): void {
    if (this.cartItems.length === 0) {
      this.snackBar.open('No hay items en el carrito.', 'Cerrar', { duration: 3000 });
      return;
    }

    if (this.selectedOption === 'card') {
      if (!this.emailForKey.trim()) {
        this.emailCtrl?.control?.markAsTouched();
        this.checkInput();
        this.snackBar.open('El correo es obligatorio.', 'Cerrar', { duration: 3000 });
        return;
      }

      if (!this.isEmailValid()) {
        this.emailCtrl?.control?.markAsTouched();
        this.snackBar.open('Formato de correo incorrecto.', 'Cerrar', { duration: 3000 });
        return;
      }
    }

    this.orderDetails = this.buildOrderRequest();

    if (!this.orderDetails) {
      this.snackBar.open('Error al procesar la información de la orden.', 'Cerrar', { duration: 3000 });
      return;
    }

    // Procesar la opción seleccionada
    const option = this.selectedOption;
    this.selectedOption = null;

    if (option === 'paypal') {
      this.showPayPalButton = true;
    } else if (option === 'card') {
      this.showCardButton = true;
    } else if (option === 'TIGO MONEY') {
      this.showPaymentModal = true;
    } else {
      console.warn('No se ha seleccionado ninguna opción.');
    }
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

    const order = this.buildOrderRequest();
    if (!order) {
      throw new Error('No se pudo crear la orden debido a falta de información de usuario o invitado.');
    }
    return order;
  }

  private buildOrderRequest(): OrderRequest | undefined {
    // Si no hay usuario ni guest, no podemos crear la orden
    if (!this.userId && !this.guestId) return undefined;

    let products = [];
    let calculatedAmount = 0;

    // Caso 1: Compra directa de un solo producto (productId seteado manualmente)
    if (this.productId !== null) {
      products = [{
        kinguinId: this.productId,
        qty: 1,
        price: this.totalHNL || this.totalPrice,
        name: 'Producto'
      }];
      calculatedAmount = this.totalHNL || this.totalPrice;
    }
    // Caso 2: Carrito con productos
    else if (this.cartItems.length > 0) {
      products = this.cartItems.map(item => ({
        kinguinId: item.giftcard.kinguinId || item.cartItem.productId || 0,
        qty: item.cartItem.quantity,
        price: item.giftcard.priceHNL || item.giftcard.price,
        name: item.giftcard.name || 'Producto'
      }));
      calculatedAmount = this.cartItems.reduce((total, item) => total + ((item.giftcard.priceHNL || item.giftcard.price) * item.cartItem.quantity), 0);
    }
    // Caso 3: Carrito vacío pero se requiere una orden (Ej. recargar balance)
    else {
      products = [{
        kinguinId: -1,
        qty: 1,
        price: this.totalPrice,
        name: 'Balance'
      }];
      calculatedAmount = this.totalPrice;
    }

    return {
      userId: this.userId ? Number(this.userId) : null,
      guestId: this.guestId || null,
      email: this.wantsEmailKey ? (this.userEmail || this.emailForKey) : this.emailForKey,
      phoneNumber: this.paymentDetails.phoneNumber,
      products: products,
      amount: calculatedAmount,
      manual: this.isManualTransaction,
      sendKeyToSMS: this.wantsSMSKey,
      gameUserId: this.gameUserId || undefined,
      promoCode: this.promo?.code
    };
  }

  // ==========================================
  // PROMOCIONES
  // ==========================================

  checkIfCodeExists(code: string): void {
    if (!code) return;

    this.promotionService.promotionCodeExist(code).pipe(
      takeUntil(this.destroy$),
      switchMap(exists => {
        this.codeExist = exists;
        this.codeExistBlueprint = exists;

        if (exists) {
          return this.promotionService.fetchPromotionWithCode(code);
        }
        return of(null);
      })
    ).subscribe(promo => {
      if (promo) {
        this.promo = promo;
        this.promoCode = promo.code;
        this.discountReceived = `Has recibido un ${promo.discountPorcentage}% de descuento`;

        if (!this.discountApplied) {
          this.applyDiscountMath();
          this.discountApplied = true;
          this.snackBar.open('¡Descuento aplicado a tu orden!', 'Cerrar', { duration: 5000 });
        }
      }
    });
  }

  private applyDiscountMath(): void {
    if (!this.promo) return;
    const total = this.cartItems.reduce((sum, item) => sum + item.cartItem.quantity * (item.giftcard.priceHNL || 0), 0);
    const discount = total * (this.promo.discountPorcentage / 100);
    this.totalHNL = parseFloat((total - discount).toFixed(2));
  }

  // ==========================================
  // EVENTOS Y VALIDADORES DE UI
  // ==========================================

  onPaymentSuccess(transactionNumber: string) {
    this.cartService.removeAllCartItems();
    this.router.navigate(['/purchase-confirmation'], {
      queryParams: { transactionNumber: transactionNumber }
    });
  }

  handleTransactionCancelled() {
    this.showCancelledModal = true;
  }

  openTerms(): void {
    this.dialog.open(TermsAndConditionsComponent, {
      width: '600px',
      maxHeight: '80vh',
    });
  }

  isPaymentReady(): boolean {
    if (!this.selectedOption) return false;
    if (this.selectedOption !== 'card') return true;
    return !!this.emailForKey?.trim() && this.isEmailValid();
  }

  private isEmailValid(): boolean {
    return new RegExp(this.emailRegex).test(this.emailForKey.trim());
  }

  checkInput() {
    this.emailErrorMessage = !!this.emailForKey;
  }

  getTotalPrice(): number {
    return this.totalHNL;
  }
}
