// tigo-payment.component.ts

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { CartItemWithGiftcard } from "../cart/CartItem";
import { TigoService } from "./tigo.service";
import { WebSocketService } from "../services/web-socket.service";
import { Subscription, take, firstValueFrom } from "rxjs";
import { NotificationService } from "../services/notification.service";
import { TransactionsService } from "../transactions/transactions.service";
import { Transaction } from "../transactions/transaction.model";
import { AuthService } from "../services/auth.service";
import { GuestService } from "../services/guest.service";
import { Router } from "@angular/router";
import { CurrencyService } from "../services/currency.service";
import { PaymentMethod } from "../payment-options/payment-method.interface";
import { PaymentService } from "../payment-options/payment.service";
import {
  CART_ITEMS,
  GAME_USER_ID,
  IS_MANUAL_TRANSACTION,
  PRODUCT_ID,
  PROMO_CODE,
  TOTAL_PRICE
} from "../payment/payment.token";
import { TigoPaymentService } from "./tigo-payment.service";
import { OrderDetails } from "../models/order-details.model";
import { OrderRequest } from "../models/order-request.model";
import { UnmatchedPaymentResponseDto } from "../models/unmatched-payment-response.model";
import { AuthModalComponent } from "../auth-modal/auth-modal.component";
import { AccountService } from "../account.service";
import { Account, User } from "../user-details/User";
import { switchMap } from "rxjs/operators";

@Component({
  selector: 'app-tigo-payment',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgClass,
    NgForOf,
    AuthModalComponent
  ],
  templateUrl: './tigo-payment.component.html',
  styleUrls: ['./tigo-payment.component.css']
})
export class TigoPaymentComponent implements OnInit, OnDestroy {

  cartItems = inject(CART_ITEMS, { optional: true }) || [];
  @Input() cartItemsFromCartComponent: CartItemWithGiftcard[] = [];
  totalPrice = inject(TOTAL_PRICE, { optional: true }) || 0;
  productId = inject(PRODUCT_ID, { optional: true });
  gameUserId = inject(GAME_USER_ID, { optional: true });
  isManualTransaction = inject(IS_MANUAL_TRANSACTION);
  promoCode = inject(PROMO_CODE, { optional: true });

  private postLoginAction: (() => void) | null = null;
  unmatchedPaymentResponse: UnmatchedPaymentResponseDto | null = null;
  account: Account | null = null;
  accountId: number = 0;

  paymentReferenceNumber: string = "";
  insufficientPaymentAmount: string = "";
  showInsufficientPaymentAmount: boolean = false;
  user: User | null = null;
  @Output() close = new EventEmitter<void>();

  userEmail: string = '';
  notifMessage: string = '';
  showModal: boolean = true;
  showAuthModal: boolean = false;
  showConfirmation: boolean = false;
  showSpinner: boolean = false;
  transaction: Transaction | null = null;
  successMessage: string = '';
  errorMessage: string = '';
  transactionStatus: string = '';
  transactionSubscription: Subscription | null = null;
  transactionNumberSubscription: Subscription | null = null;
  transactionNumber: string | null = "";
  orderRequestNumber: string = '';
  isCancelling: boolean = false;
  tigoImageUrl: string = 'https://i0.wp.com/logoroga.com/wp-content/uploads/2013/11/tigo-money-01.png?fit=980%2C980&ssl=1';
  tempPin: string = '';
  currentTransaction: Transaction | null = null;
  verifyTransactionSubscription: Subscription | null = null;
  private transactionStatusSubscription: Subscription | undefined;
  private errorMessageSubscription: Subscription | undefined;

  showVerificationForm: boolean = false;
  verificationMessage: string = '';
  verificationData = {
    pin: '',
    refNumber: ''
  };

  showManualVerificationForm: boolean = false;
  manualVerificationData = {
    refNumber: ''
  };
  manualVerificationError: string = '';
  manualVerificationSuccess: string = '';

  // Datos de pago / detalles del usuario
  paymentDetails = {
    name: '',
    address: '',
    phoneNumber: '',
    total: 0
  };

  userId: number | null = null;
  guestId: string | null = null;

  // Manejo de Exchange Rate
  private exchangeRateSubscription: Subscription | null = null;
  exchangeRate: number = 24.5; // Valor inicial
  isLoading: boolean = false;
  conversionError: string = '';

  // Manejo de envío de clave
  wantsSMSKey: boolean = false;
  showEmailPrompt: boolean = false;
  emailForKey: string = '';
  isEmailPromptComplete: boolean = false;

  // Nueva variable para rastrear la verificación del pago
  isPaymentVerified: boolean = false;

  // Recibimos un totalAmount si fuera necesario
  @Input() totalAmount!: number;
  @Input() amountHNL = 0;
  @Input() promo_code: string | null = "Muster";

  // ─────────────────────────────────────────────────────
  //        Manejo de "steps" para el workflow
  // Step 1: Ingresar Ref
  // Step 2: Email / SMS
  // Step 3: Resumen
  // Step 4: Procesamiento / resultado final
  // ─────────────────────────────────────────────────────
  step: number = 1;

  constructor(
    private accountService: AccountService,
    private tigoService: TigoService,
    private tigoPaymentService: TigoPaymentService,
    private paymentService: PaymentService,
    private currencyService: CurrencyService,
    private webSocketService: WebSocketService,
    private notificationService: NotificationService,
    private transactionService: TransactionsService,
    protected authService: AuthService,
    private guestService: GuestService,
    private router: Router
  ) {
    // Conexión websocket
    this.webSocketService.connect();
  }

  ngOnInit(): void {
    this.loadExchangeRate();
    // Guardar total en paymentDetails
    this.paymentDetails.total = this.amountHNL;

    // Ver si el usuario está logueado
    if (this.authService.isLoggedIn()) {
      const storedUserId = sessionStorage.getItem("userId");
      this.authService.getUserDetails().subscribe(data => {
        this.user = data;
        this.userEmail = data.email; // guardamos el correo
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
      // Si es invitado
      this.guestId = this.guestService.getGuestId();
    }

    // Suscripción a mensajes de error
    this.errorMessageSubscription = this.tigoPaymentService.errorMessage$.subscribe(message => {
      this.errorMessage = message;
    });

    // Suscripción a verificación
    this.verifyTransactionSubscription = this.tigoPaymentService.verificationRequest$.subscribe(message => {
      this.verificationMessage = message;
    });

    // Suscripción a transacciones
    this.transactionSubscription = this.tigoPaymentService.transaction$.subscribe(message => {
      this.currentTransaction = message;
    });

    // Suscripción al estado de transacción vía WebSocket
    this.transactionStatusSubscription = this.webSocketService.subscribeToTransactionStatus().subscribe(parsedMessage => {
      this.transactionStatus = parsedMessage.status;
      this.showSpinner = !(
        this.transactionStatus === 'COMPLETED' ||
        this.transactionStatus === 'AWAITING_MANUAL_PROCESSING' ||
        this.transactionStatus === 'CANCELLED' ||
        this.transactionStatus === 'PROCESSING'
      );
    });

    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  // ─────────────────────────────────────────────────────
  //                Desuscripción en OnDestroy
  // ─────────────────────────────────────────────────────
  ngOnDestroy(): void {
    if (this.exchangeRateSubscription) {
      this.exchangeRateSubscription.unsubscribe();
    }
    if (this.transactionSubscription) {
      this.transactionSubscription.unsubscribe();
    }
    if (this.transactionNumberSubscription) {
      this.transactionNumberSubscription.unsubscribe();
    }
    if (this.verifyTransactionSubscription) {
      this.verifyTransactionSubscription.unsubscribe();
    }
    if (this.transactionStatusSubscription) {
      this.transactionStatusSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  // ─────────────────────────────────────────────────────
  //            Workflow por Steps (1,2,3,4)
  // ─────────────────────────────────────────────────────

  // Paso 1: El usuario ingresa la referencia
  goToStep2AfterRef(): void {
    if (!this.manualVerificationData.refNumber) {
      this.manualVerificationError = 'Por favor, ingrese el número de referencia.';
      return;
    }
    this.manualVerificationError = '';
    this.step = 2;
  }

  // Paso 2: El usuario elige Email y/o SMS
  goToStep3AfterEmailSms(): void {
    if (!this.emailForKey && !this.wantsSMSKey) {
      this.errorMessage = 'Debe proporcionar un correo electrónico o seleccionar enviar por SMS.';
      return;
    }
    this.errorMessage = '';
    this.step = 3;
  }

  // Paso 3: Muestra Resumen (productos, cantidad, precios) y Email/SMS
  // Al hacer clic en "Continuar" => confirmVerification => Paso 4
  goToStep4ConfirmVerification(): void {
    // En lugar de showEmailPrompt = false, pasamos a step = 4
    this.step = 4;
    this.confirmVerification();
  }

  // ─────────────────────────────────────────────────────
  //    Funciones de verificación y envío al servidor
  // ─────────────────────────────────────────────────────

  // Mantenemos la lógica original de confirmVerification
  // pero la llamamos en step=4.
  async confirmVerification(): Promise<void> {
    const refNumber = this.manualVerificationData.refNumber;
    const phoneNumber = this.paymentDetails.phoneNumber;
    let orderDetails: OrderRequest;

    const computedAmount = this.cartItems.length
      ? this.cartItems.reduce(
        (tot, i) => tot + i.giftcard.priceHNL * i.cartItem.quantity, 0)
      : this.amountHNL;


    // Si existe productId => un solo producto
    if (this.productId !== null) {
      orderDetails = {
        userId: this.userId,
        guestId: this.guestId,
        email: this.userEmail || this.emailForKey,
        phoneNumber: phoneNumber,
        products: this.cartItems.map(item => ({
          kinguinId: item.cartItem.productId,
          qty: item.cartItem.quantity,
          price: item.giftcard.price,
          name: item.giftcard.name
        })),
        amount: this.amountHNL,
        manual: this.isManualTransaction,
        sendKeyToSMS: this.wantsSMSKey,
        sendKeyToWhatsApp: this.wantsSMSKey,
        promoCode: this.promoCode
      };
      if (this.gameUserId !== null) {
        orderDetails.gameUserId = this.gameUserId;
      }
    }
    else if (this.authService.isAuthenticated() && this.userId !== null) {
      // Usuario logueado con cartItems o sin cartItems
      if (this.cartItems && this.cartItems.length > 0) {
        orderDetails = {
          userId: this.userId,
          phoneNumber: phoneNumber,
          email: this.userEmail || this.emailForKey,
          products: this.cartItems.map(item => ({
            kinguinId: item.cartItem.productId,
            qty: item.cartItem.quantity,
            price: item.giftcard.price,
            name: item.giftcard.name
          })),
          amount: this.amountHNL,
          manual: this.isManualTransaction,
          sendKeyToSMS: this.wantsSMSKey,
          sendKeyToWhatsApp: this.wantsSMSKey,
          promoCode: this.promoCode
        };
        if (this.gameUserId !== null) {
          orderDetails.gameUserId = this.gameUserId;
        }
      } else {
        // Sin cartItems => recarga Balance
        orderDetails = {
          userId: this.userId,
          phoneNumber: phoneNumber,
          email: this.userEmail || this.emailForKey,
          products: this.cartItems.map(item => ({
            kinguinId: item.cartItem.productId,
            qty: item.cartItem.quantity,
            price: item.cartItem.price,
            name: item.giftcard.name
          })),
          amount: this.amountHNL,
          manual: this.isManualTransaction,
          sendKeyToSMS: this.wantsSMSKey,
          sendKeyToWhatsApp: this.wantsSMSKey,
          promoCode: this.promoCode
        };
      }
      if (this.gameUserId !== null) {
        orderDetails.gameUserId = this.gameUserId;
      }
    }
    else if (this.guestId) {
      // Invitado
      if (this.cartItems && this.cartItems.length > 0) {
        orderDetails = {
          guestId: this.guestId,
          phoneNumber: phoneNumber,
          email: this.emailForKey,
          products: this.cartItems.map(item => ({
            kinguinId: item.cartItem.productId,
            qty: item.cartItem.quantity,
            price: item.giftcard.price,
            name: item.giftcard.name
          })),
          amount: this.amountHNL,
          manual: this.isManualTransaction,
          sendKeyToSMS: this.wantsSMSKey,
          sendKeyToWhatsApp: this.wantsSMSKey,
          promoCode: this.promoCode
        };
        if (this.gameUserId !== null) {
          orderDetails.gameUserId = this.gameUserId;
        }
      } else {
        // Invitado sin cartItems => Balance
        orderDetails = {
          guestId: this.guestId,
          phoneNumber: phoneNumber,
          email: this.emailForKey,
          products: [{
            kinguinId: -1,
            qty: 1,
            price: 1,
            name: 'Balance'
          }],
          amount: this.amountHNL,
          manual: this.isManualTransaction,
          sendKeyToSMS: this.wantsSMSKey,
          sendKeyToWhatsApp: this.wantsSMSKey,
          promoCode: this.promoCode
        };
        if (this.gameUserId !== null) {
          orderDetails.gameUserId = this.gameUserId;
        }
      }
    }
    else {
      this.showSpinner = false;
      return;
    }

    const expectedAmount = this.totalPrice;

    try {
      const isVerified = await this.verifyUnmatchedPayment(refNumber, expectedAmount);
      if (isVerified) {
        orderDetails.refNumber = refNumber;
        this.paymentReferenceNumber = refNumber;
        this.tigoPaymentService.initializePayment(orderDetails);
        this.showSpinner = true;
        this.isPaymentVerified = true;
        this.manualVerificationSuccess = 'Su pago ha sido verificado.';

        if (this.unmatchedPaymentResponse) {
          if (this.unmatchedPaymentResponse.difference === 0) {
            this.transactionSubscription = this.tigoPaymentService.transaction$.subscribe(transaction => {
              this.currentTransaction = transaction;
              if (this.currentTransaction?.transactionNumber) {
                this.router.navigate(['/purchase-confirmation'], {
                  queryParams: { transactionNumber: this.currentTransaction.transactionNumber }
                });
              }
            });
          } else if (this.unmatchedPaymentResponse.difference < 0) {
            this.insufficientPaymentAmount =
              "El pago ingresado fue insuficiente. Comunícate con nuestro servicio al cliente para efectuar la devolución o compensarlo con otro pago.";
            this.showInsufficientPaymentAmount = true;
          }
        }
      } else {
        this.isPaymentVerified = false;
        this.manualVerificationError =
          'Su código de referencia parece ser incorrecto, recargue la página e intente de nuevo.';
        this.manualVerificationSuccess = '';
      }
    } catch (error) {
      this.isPaymentVerified = false;
      this.manualVerificationError =
        'Error al verificar el pago. Por favor, inténtelo nuevamente.';
      this.manualVerificationSuccess = '';
    }
  }

  // ─────────────────────────────────────────────────────
  //                Verificación Unmatched
  // ─────────────────────────────────────────────────────
  async verifyUnmatchedPayment(referenceNumber: string, expectedAmount: number): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.transactionService.verifyUnmatchedPaymentAmount(referenceNumber, expectedAmount)
      );
      this.unmatchedPaymentResponse = response;
      return true;
    } catch (error: any) {
      if (error && typeof error === 'object' && 'error' in error) {
        this.manualVerificationError =
          (error as any).error?.message || 'Error al verificar el pago. Por favor, inténtelo nuevamente.';
      } else {
        this.manualVerificationError = 'Error desconocido al verificar el pago.';
      }
      return false;
    }
  }

  // ─────────────────────────────────────────────────────
  // Manejo de Exchange Rate
  // ─────────────────────────────────────────────────────
  loadExchangeRate(): void {
    this.isLoading = true;
    this.exchangeRateSubscription = this.currencyService.getExchangeRateEURtoHNL(1).subscribe({
      next: (rate) => {
        this.exchangeRate = rate;
        this.isLoading = false;
      },
      error: (err) => {
        this.conversionError = 'No se pudo cargar la tasa de cambio. Inténtelo más tarde.';
        this.isLoading = false;
      }
    });
  }

  // ─────────────────────────────────────────────────────
  //     Opciones si se detecta un pago no coincidente
  // ─────────────────────────────────────────────────────
  async handleOptionSelection(option: string): Promise<void> {
    switch (option) {
      case 'Quiero mi dinero de nuevo':
        this.requestRefund();
        break;
      case 'Combinar este pago con otro nuevo pago':
        this.combineWithNewPayment();
        break;
      case 'Apply the difference as a balance':
        try {
          await this.applyBalance();
          this.router.navigate(['/purchase-confirmation'], {
            queryParams: { transactionNumber: this.currentTransaction?.transactionNumber }
          });
        } catch (error) {
          console.error('Error al aplicar el balance. No se puede redirigir.', error);
          this.notificationService.addNotification(
            'Error al aplicar el balance. Por favor, inténtelo nuevamente.',
            'https://i0.wp.com/logoroga.com/wp-content/uploads/2013/11/tigo-money-01.png?fit=980%2C980&ssl=1'
          );
        }
        break;
      case 'Return the difference':
        this.returnDifference();
        break;
      case 'Pay Anyways':
        this.router.navigate(['/purchase-confirmation'], {
          queryParams: { transactionNumber: this.currentTransaction?.transactionNumber }
        });
        break;
      default:
        console.warn('Opción no reconocida:', option);
    }
  }

  requestRefund(): void {

  }

  combineWithNewPayment(): void {

  }

  applyBalance(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.unmatchedPaymentResponse || !this.unmatchedPaymentResponse.unmatchedPayment.id) {
        this.errorMessage = 'No se puede aplicar el balance. Información de la cuenta faltante.';
        reject('Información faltante');
        return;
      }

      const balanceToApply = this.unmatchedPaymentResponse.difference;
      if (balanceToApply <= 0) {
        this.errorMessage = 'El balance debe ser mayor que 0 para aplicar.';
        reject('Balance inválido');
        return;
      }

      this.authService.getUserDetails().pipe(
        switchMap(data => {
          this.userId = data.account.id;
          this.account = data.account;
          return this.accountService.applyBalance(
            data.id,
            parseFloat(balanceToApply.toFixed(2)),
            this.paymentReferenceNumber
          );
        })
      ).subscribe({
        next: (response) => {
          this.notifMessage = 'Balance aplicado exitosamente. Tu balance ha sido actualizado.';
          resolve();
        },
        error: (error) => {
          this.errorMessage = 'Error al aplicar el balance. Por favor, inténtelo nuevamente.';
          reject(error);
        }
      });
    });
  }

  returnDifference(): void {

  }

  adjustPayment(): void {

  }

  retryPayment() {

  }

  // ─────────────────────────────────────────────────────
  //    Manejo de Verificación Manual (show/hide)
  // ─────────────────────────────────────────────────────
  showManualVerification(): void {
    this.showManualVerificationForm = true;
  }

  hideManualVerification(): void {
    this.showManualVerificationForm = false;
    this.manualVerificationData.refNumber = '';
    this.manualVerificationError = '';
    this.manualVerificationSuccess = '';
    this.unmatchedPaymentResponse = null;
    this.isPaymentVerified = false;
  }

  // ─────────────────────────────────────────────────────
  //   Manejo del prompt de email (opcional, heredado)
  // ─────────────────────────────────────────────────────
  submitManualVerification(): void {
    // Lo usabas para mostrar el prompt de email directamente
    if (!this.manualVerificationData.refNumber) {
      this.manualVerificationError = 'Por favor, ingrese el número de referencia.';
      return;
    }
    // En un flujo alternativo, mostrabas showEmailPrompt
    this.showEmailPrompt = true;
  }

  confirmEmailPrompt() {
    // Lógica para procesar el email o SMS
    if (this.emailForKey || this.wantsSMSKey) {
      this.showEmailPrompt = false;
      // llamamos confirmVerification, o pasamos a step=3 / step=4
      // Aquí se eligió directamente confirmVerification
      this.confirmVerification();
    } else {
      this.errorMessage = 'Debe proporcionar un correo electrónico o seleccionar enviar por SMS.';
    }
  }

  hideEmailPrompt(): void {
    this.showEmailPrompt = false;
    this.emailForKey = '';
    this.wantsSMSKey = false;
    this.successMessage = '';
    this.errorMessage = '';
  }

  isEmailValid(): boolean {
    // Validación simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.emailForKey);
  }

  // ─────────────────────────────────────────────────────
  //            Cancelar Transacción, Cerrar Modal
  // ─────────────────────────────────────────────────────
  handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.transactionStatus === 'PENDING') {
      this.cancelTransaction(this.transactionNumber, this.orderRequestNumber);
    }
  }

  handleClose(): void {
    this.closeModal();
    if (this.transactionStatus === 'PENDING') {
      this.cancelTransaction(this.transactionNumber, this.orderRequestNumber);
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.close.emit();
  }

  cancelTransaction(transactionNumber: string | null, orderRequestId: string): void {
    this.isCancelling = true;
    this.transactionService.cancelTransaction(transactionNumber, orderRequestId)
      .pipe(take(1))
      .subscribe({
        next: (updatedTransaction: Transaction) => {
          this.transaction = updatedTransaction;
          this.transactionStatus = 'CANCELLED';
          this.notifMessage = 'Tu pago fue cancelado.';
          this.isCancelling = false;
          this.showSpinner = false;
        },
        error: (error: any) => {
          this.errorMessage = 'Error al cancelar la transacción.';
          this.isCancelling = false;
          this.showSpinner = false;
        }
      });
  }

  reloadPage(): void {
    window.location.reload();
  }

  // ─────────────────────────────────────────────────────
  //           Manejo de AuthModal (opcional)
  // ─────────────────────────────────────────────────────
  handleAuthModalClose(): void {
    this.showAuthModal = false;
    this.postLoginAction = null;
  }

  handleAuthSuccess(): void {
    this.showAuthModal = false;
    if (this.postLoginAction) {
      this.postLoginAction();
      this.postLoginAction = null;
    }
  }
}
