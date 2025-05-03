import {AfterViewInit, Component, HostListener, input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CartService} from "./cart.service";
import {DecimalPipe, NgForOf, NgIf} from "@angular/common";
import {Event, Router, RouterLink} from "@angular/router";
import { TigoPaymentComponent } from "../tigo-payment/tigo-payment.component";
import {CartItemWithGiftcard} from "./CartItem";
import {CurrencyService} from "../services/currency.service";
import {FormsModule, NgModel} from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { MatDialog } from "@angular/material/dialog";
import {AuthService} from "../services/auth.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import { RecommendationsComponent } from "../recommendations/recommendations.component";
import {Observable, Subject, takeUntil} from "rxjs";
import { CART_ITEMS, TOTAL_PRICE, PRODUCT_ID, GAME_USER_ID, IS_MANUAL_TRANSACTION, PROMO_CODE } from "../payment/payment.token";
import { OrderRequest } from "../models/order-request.model";
import {GuestService} from "../services/guest.service";
import {User} from "../user-details/User";
import {TermsAndConditionsComponent} from "../terms-and-conditions/terms-and-conditions.component";
import {PromotionsService} from "../promotions/promotions.service";
import {Promotion} from "../promotions/Promotion.model";
import { CardPaymentComponent } from "../payment/Stripe/card-payment/card-payment.component";
import {PricingService} from "../pricing/pricing.service";
import {ConvertToHnlPipe} from "../pipes/convert-to-hnl.pipe";


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    TigoPaymentComponent,
    FormsModule,
    MatIcon,
    RecommendationsComponent,
    DecimalPipe,
    CardPaymentComponent,
    ConvertToHnlPipe
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
    },
    {
      provide: PROMO_CODE,
      useValue: null
    }
  ]
})
export class CartComponent implements OnInit, OnDestroy, AfterViewInit {
  cartItems: CartItemWithGiftcard[] = [];
  exchangeRate: number = 0;
  showDialog: boolean = false
  protected showPaymentModal: boolean = false;
  cartItemCount: number = 0;
  isLoading: boolean = false;
  totalPriceEUR: number = 0;
  conversionError: string = '';
  userId: number | null = null;
  user: User | null = null;
  showPaypalPaymentModal: boolean = false;
  discountApplied: boolean = false;
  totalAmountString: string | null = '';
  totalAmountUSD: number | null = 0;
  totalAmountUSDString: string | null = '';
  private destroy$ = new Subject<void>();
  showCardButton: boolean = false;
  showPayPalButton: boolean = false;
  totalHNL: number = 0;
  isEmailPromptComplete: boolean = false;
  showEmailPrompt: boolean = false;
  wantsEmailKey: boolean = false;
  emailErrorMessage: boolean = false;
  wantsSMSKey: boolean = false;
  emailForKey: string = '';
  promo: Promotion | undefined = undefined;
  userEmail?: string;
  emailRegex = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
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

  showCancelledModal: boolean = false;
  protected codeExistBlueprint: boolean = false;
  protected discountReceived: string = "";

  @ViewChild('emailCtrl') emailCtrl!: NgModel;

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

  @HostListener('window:load', ['$event'])
  onLoad(event: Event) {
    this.loadCartItems();
    this.countCartItems();
    this.initExchangeRate();
    this.currencyService.getExchangeRateEURtoHNL(1).subscribe(
      value => {
        this.exchangeRate = value;
      }
    );
    const totalEUR = this.cartItems
      .reduce((sum, i) => sum + i.cartItem.quantity * i.giftcard.price, 0);


    // Si aún no tenemos tasa de cambio esperamos a que llegue
    if (this.exchangeRate) {
      this.totalHNL = this.pricing.calculateConvertedPrice(totalEUR, this.exchangeRate);
    }
  }

  ngOnInit(): void {
    this.loadCartItems();
    this.countCartItems();
    this.recalcTotals();
    this.initExchangeRate();
    const totalEUR = this.cartItems
      .reduce((sum, i) => sum + i.cartItem.quantity * i.giftcard.price, 0);


    // Si aún no tenemos tasa de cambio esperamos a que llegue
    if (this.exchangeRate) {
      this.totalHNL = this.pricing.calculateConvertedPrice(totalEUR, this.exchangeRate);
    }
    console.log("COUNT : " + this.cartItemCount)
    console.log("TOTAL AMOUNT STRING: " + this.totalAmountString)
    this.currencyService.getExchangeRateEURtoHNL(1).subscribe(
      value => {
        this.exchangeRate = value;
        console.log("THIS EXCHANGE RATE: " + this.exchangeRate);
      }
    );

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
      .subscribe(async items => {
        this.cartItems = items;
        this.updateCartItemCount();


        /* ——— nuevo cálculo reactivo ——— */
        await this.recalcTotals();

        /* ——— derivados ——— */
        this.totalAmountUSD       = +(this.totalHNL / 26).toFixed(2);
        this.totalAmountUSDString = this.totalAmountUSD.toString();
        this.totalAmountString    = this.totalHNL.toString();
      });
  }


  private async recalcTotals(): Promise<void> {
    /* 1) Calculamos cada línea en paralelo               */
    const promises = this.cartItems.map(item =>
      this.pricing.convert(
        item.giftcard.price * item.cartItem.quantity,
        this.exchangeRate
      )
    );

    /* 2) Esperamos a que todas terminen y sumamos         */
    const converted = await Promise.all(promises);
    this.totalHNL   = converted.reduce((sum, price) => sum + price, 0);
  }



  selectOption(option: string): void {
    this.selectedOption = option;
  }


  private initExchangeRate(): void {
    this.currencyService.getExchangeRateEURtoHNL(1)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async rate => {
        this.exchangeRate = rate;
        await this.recalcTotals();      // ← segundo cálculo, ahora con la tasa
      });
  }


  continueWithOption(): void {
    if (this.cartItems.length === 0) {
      this.snackBar.open('No hay items en el carrito.', 'Cerrar', { duration: 3000 });
      return;
    }

    const phoneNumber = this.paymentDetails.phoneNumber;
    let orderDetails: OrderRequest | undefined;

    if (this.productId !== null) {
      orderDetails = {
        userId: this.userId ? Number(this.userId) : null,
        guestId: this.guestId || null,
        email: this.emailForKey || '',
        phoneNumber: phoneNumber,
        products: [{
          kinguinId: this.productId,
          qty: 1,
          price: this.totalHNL,
          name: 'Producto'
        }],
        amount: this.totalHNL,
        manual: this.isManualTransaction,
        sendKeyToSMS: this.wantsSMSKey,
        gameUserId: this.gameUserId || undefined,
        promoCode: this.promo?.code
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
            price: item.giftcard.priceHNL,
            name: 'Producto'
          })),
          amount: this.cartItems.reduce((total, item) => total + (item.giftcard.priceHNL * item.cartItem.quantity), 0),
          manual: this.isManualTransaction,
          sendKeyToSMS: this.wantsSMSKey,
          gameUserId: this.gameUserId || undefined,
          promoCode: this.promo?.code
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
          gameUserId: this.gameUserId || undefined,
          promoCode: this.promo?.code
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
            price: item.giftcard.priceHNL,
            name: 'Producto'
          })),
          amount: this.cartItems.reduce((total, item) => total + (item.giftcard.priceHNL * item.cartItem.quantity), 0),
          manual: this.isManualTransaction,
          sendKeyToSMS: this.wantsSMSKey,
          gameUserId: this.gameUserId || undefined,
          promoCode: this.promo?.code
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
          amount: this.totalHNL,
          manual: this.isManualTransaction,
          sendKeyToSMS: this.wantsSMSKey,
          gameUserId: this.gameUserId || undefined,
          promoCode: this.promo?.code
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

    this.orderDetails = orderDetails;

    if (this.selectedOption === 'paypal') {
      this.selectedOption = null;
      this.showPayPalButton = true;
    } else if (this.selectedOption === 'card') {

      /* ---- VALIDACIONES ---- */
      if (!this.emailForKey.trim()) {
        this.emailCtrl.control.markAsTouched();
        this.checkInput();
        this.snackBar.open('El correo es obligatorio.', 'Cerrar', { duration: 3000 });
        return;
      }

      if (!this.isEmailValid()) {
        this.emailCtrl.control.markAsTouched();
        this.snackBar.open('Formato de correo incorrecto.', 'Cerrar', { duration: 3000 });
        return;
      }

      /* ---- Si todo está bien, ya podemos mostrar el botón de Stripe ---- */
      this.selectedOption = null;      // ← mover AQUÍ (después de validar)
      this.showCardButton  = true;
    }
    else if (this.selectedOption === 'TIGO MONEY') {
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
      this.recalcTotals()
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
      this.cartService.removeCartItem(item.cartItem.productId).subscribe(() => {
        this.cartItems = this.cartItems.filter(cartItem => cartItem.cartItem.productId !== item.cartItem.productId);
        this.updateCartItemCount();
        this.showDialog = true;
        setTimeout(() => {
          this.closeDialog();
        }, 3000);
        this.recalcTotals();
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
    return this.totalHNL;
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
            name: item.giftcard.name
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
            name: item.giftcard.name
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

    this.cartService.removeAllCartItems();
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

  checkIfCodeExists(code: string): Observable<boolean> {

    this.promotionService.promotionCodeExist(code).subscribe( value => {
      this.codeExist = value;
      this.codeExistBlueprint = value;
      if (value){
        this.fetchPromoWithCode(code);
      }
    });
    return this.promotionService.promotionCodeExist(code);
  }

  fetchPromoWithCode(code: string ){
    if (this.codeExistBlueprint){
      this.promotionService.fetchPromotionWithCode(code).subscribe(
        (value) => {
          this.promo = value;
          this.discountReceived = value ? `You have received ${this.promo.discountPorcentage} of discount` : "You have not received discount";
          if (this.promo && !this.discountApplied){
            let total = this.cartItems.reduce((sum, item) => sum + item.cartItem.quantity * item.giftcard.priceHNL, 0);
            this.totalHNL =  parseFloat(total.toFixed(2)) - (parseFloat(total.toFixed(2)) * (this.promo.discountPorcentage / 100));
            console.log("PROMO DISCOUNT: " + this.promo?.discountPorcentage)
            this.promoCode = value.code;
          }
        });
    }
    this.snackBar.open('Descuento aplicado a tu orden de compra', 'Cerrar', { duration: 5000 });
  }

  calculatePromoDiscount() : number {
    return this.promo != undefined ? this.promo.discountPorcentage : 1;
    console.log("TOTAL AMOUNT HNL AFTER DISCOUNT" + this.totalHNL)
  }

  protected readonly Number = Number;
  promoCode: string = "";
  codeExist: boolean = true;


  private isEmailValid(): boolean {
    return new RegExp(this.emailRegex).test(this.emailForKey.trim());
  }

  isPaymentReady(): boolean {
    if (!this.selectedOption) { return false; }
    if (this.selectedOption !== 'card') { return true; }
    return !!this.emailForKey?.trim() && this.isEmailValid();
  }

  checkInput() {
    if (this.emailForKey){
      this.emailErrorMessage = true;
    }
  }

  protected readonly input = input;

  ngAfterViewInit(): void {
    this.recalcTotals();
  }
}
