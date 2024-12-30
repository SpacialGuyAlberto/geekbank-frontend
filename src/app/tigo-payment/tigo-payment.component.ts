// tigo-payment.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { CartItemWithGiftcard } from "../models/CartItem";
import { TigoService } from "../tigo.service";
import { WebSocketService } from "../web-socket.service";
import { Subscription, take, firstValueFrom } from "rxjs";
import { NotificationService } from "../services/notification.service";
import { TransactionsService } from "../transactions.service";
import { Transaction } from "../models/transaction.model";
import { AuthService } from "../auth.service";
import { GuestService } from "../guest.service";
import { Router } from "@angular/router";
import { CurrencyService } from "../currency.service";
import { PaymentMethod } from "../models/payment-method.interface";
import { PaymentService } from "../payment.service";
import { CART_ITEMS, GAME_USER_ID, IS_MANUAL_TRANSACTION, PRODUCT_ID, TOTAL_PRICE } from "../payment/payment.token";
import { TigoPaymentService } from "../tigo-payment.service";
import { OrderDetails } from "../models/order-details.model";
import { OrderRequest } from "../models/order-request.model";
import { UnmatchedPaymentResponseDto } from "../models/unmatched-payment-response.model";
import { AuthModalComponent } from "../auth-modal/auth-modal.component";
import { AccountService } from "../account.service";
import { Account, User } from "../models/User";
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
  totalPrice = inject(TOTAL_PRICE, { optional: true }) || 0;
  productId = inject(PRODUCT_ID, { optional: true });
  gameUserId = inject(GAME_USER_ID, { optional: true });
  isManualTransaction = inject(IS_MANUAL_TRANSACTION);

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
  private verificationFormSubscription: Subscription | undefined;
  private spinnerSubscription: Subscription | undefined;
  private transactionStatusSubscription: Subscription | undefined;
  private tempPinSubscription: Subscription | undefined;
  private errorMessageSubscription: Subscription | undefined;
  private orderRequestIdSubscription: Subscription | undefined;

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

  paymentDetails = {
    name: '',
    address: '',
    phoneNumber: '',
    total: 0
  };
  userId: number | null = null;
  guestId: string | null = null;
  private exchangeRateSubscription: Subscription | null = null;
  exchangeRate: number = 24.5; // Valor inicial fijo
  isLoading: boolean = false;
  conversionError: string = '';

  // Variables para el prompt de envío de clave por email
  // Eliminamos wantsEmailKey y mostramos el campo de email directamente
  wantsSMSKey: boolean = false;
  showEmailPrompt: boolean = false;
  emailForKey: string = '';
  isEmailPromptComplete: boolean = false;
  @Input() totalAmount!: number;

  // Nueva variable para rastrear la verificación del pago
  isPaymentVerified: boolean = false;

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
    this.webSocketService.connect();
  }

  ngOnInit(): void {
    this.loadExchangeRate();
    this.paymentDetails.total = this.totalPrice;

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

    this.errorMessageSubscription = this.tigoPaymentService.errorMessage$.subscribe(message => {
      this.errorMessage = message;
    });

    this.verifyTransactionSubscription = this.tigoPaymentService.verificationRequest$.subscribe(message => {
      this.verificationMessage = message;
    });

    this.transactionSubscription = this.tigoPaymentService.transaction$.subscribe(message => {
      this.currentTransaction = message;
    });

    this.transactionStatusSubscription = this.webSocketService.subscribeToTransactionStatus().subscribe(parsedMessage => {
      this.transactionStatus = parsedMessage.status;
      this.showSpinner = !(this.transactionStatus === 'COMPLETED' || this.transactionStatus === 'AWAITING_MANUAL_PROCESSING'
        || this.transactionStatus === 'CANCELLED');
    });

    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

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

  closeModal(): void {
    this.showModal = false;
    this.close.emit();
  }

  async submitManualVerification(): Promise<void> {
    if (!this.manualVerificationData.refNumber) {
      this.manualVerificationError = 'Por favor, ingrese el número de referencia.';
      return;
    }

    // Mostrar el prompt de email directamente
    this.showEmailPrompt = true;
  }

  async confirmVerification(): Promise<void> {
    // Realizar la verificación del pago
    const refNumber = this.manualVerificationData.refNumber;
    const phoneNumber = this.paymentDetails.phoneNumber;
    let orderDetails: OrderRequest;

    if (this.productId !== null) {
      orderDetails = {
        userId: this.userId,
        guestId: this.guestId,
        email: this.userEmail || this.emailForKey,
        phoneNumber: phoneNumber,
        products: [{
          kinguinId: this.productId,
          qty: 1,
          price: this.totalAmount,
          name: 'Producto'
        }],
        amount: this.totalAmount,
        manual: this.isManualTransaction,
        sendKeyToSMS: this.wantsSMSKey
      };
      if (this.gameUserId !== null) {
        orderDetails.gameUserId = this.gameUserId;
      }
    } else if (this.authService.isAuthenticated() && this.userId !== null) {
      if (this.cartItems && this.cartItems.length > 0) {
        orderDetails = {
          userId: this.userId,
          phoneNumber: phoneNumber,
          email: this.userEmail || this.emailForKey,
          products: this.cartItems.map(item => ({
            kinguinId: item.cartItem.productId,
            qty: item.cartItem.quantity,
            price: item.giftcard.priceHNL,
            name: 'Producto'
          })),
          amount: this.cartItems.reduce((total, item) => total + item.giftcard.priceHNL * item.cartItem.quantity, 0),
          manual: this.isManualTransaction,
          sendKeyToSMS: this.wantsSMSKey
        };
        if (this.gameUserId !== null) {
          orderDetails.gameUserId = this.gameUserId;
        }
      } else {
        orderDetails = {
          userId: this.userId,
          phoneNumber: phoneNumber,
          email: this.userEmail || this.emailForKey,
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
      }
      if (this.gameUserId !== null) {
        orderDetails.gameUserId = this.gameUserId;
      }
    } else if (this.guestId) {
      if (this.cartItems && this.cartItems.length > 0) {
        orderDetails = {
          guestId: this.guestId,
          phoneNumber: phoneNumber,
          email: this.emailForKey,
          products: this.cartItems.map(item => ({
            kinguinId: item.cartItem.productId,
            qty: item.cartItem.quantity,
            price: item.giftcard.priceHNL,
            name: 'Producto'
          })),
          amount: this.cartItems.reduce((total, item) => total + item.giftcard.priceHNL * item.cartItem.quantity, 0),
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
          email: this.emailForKey,
          products: [{
            kinguinId: -1,
            qty: 1,
            price: this.totalPrice,
            name: 'Balance'
          }],
          amount: this.totalAmount,
          manual: this.isManualTransaction,
          sendKeyToSMS: this.wantsSMSKey
        };
        if (this.gameUserId !== null) {
          orderDetails.gameUserId = this.gameUserId;
        }
      }
    } else {
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
        // No mostrar el spinner aquí
        this.showSpinner = true;
        this.isPaymentVerified = true; // Marca como verificado
        this.manualVerificationSuccess = 'Su pago ha sido verificado. Haga clic en el botón Continuar.';
        this.manualVerificationError = '';

        if (this.unmatchedPaymentResponse) {
          if (this.unmatchedPaymentResponse.difference === 0) {
            // Preparar para la navegación
            // Esperar a que el usuario haga clic en Continuar
            this.transactionSubscription = this.tigoPaymentService.transaction$.subscribe(transaction => {
            this.currentTransaction = transaction;
          if (this.currentTransaction?.transactionNumber) {
            // Ir directo a la página de confirmación
            this.router.navigate(['/purchase-confirmation'], {
              queryParams: { transactionNumber: this.currentTransaction.transactionNumber }
            });
          }
          });
          } else if (this.unmatchedPaymentResponse.difference < 0) {
            this.insufficientPaymentAmount = "El pago ingresado fue insuficiente. Comunícate con nuestro servicio al cliente para efectuar la devolución de tu pago o compensarlo con otro pago.";
            this.showInsufficientPaymentAmount = true;
          }
        }
      } else {
        this.isPaymentVerified = false;
        this.manualVerificationError = 'Su código de referencia parece ser incorrecto, recargue la pagina e intente de nuevo por favor.';
        this.manualVerificationSuccess = '';
      }
    } catch (error) {
      this.isPaymentVerified = false;
      this.manualVerificationError = 'Error al verificar el pago. Por favor, inténtelo nuevamente.';
      this.manualVerificationSuccess = '';
    }
  }

  async verifyUnmatchedPayment(referenceNumber: string, expectedAmount: number): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.transactionService.verifyUnmatchedPaymentAmount(referenceNumber, expectedAmount)
      );
      this.unmatchedPaymentResponse = response;
      return true;
    } catch (error: any) {
      if (error && typeof error === 'object' && 'error' in error) {
        this.manualVerificationError = (error as any).error?.message || 'Error al verificar el pago. Por favor, inténtelo nuevamente.';
      } else {
        this.manualVerificationError = 'Error desconocido al verificar el pago.';
      }
      return false;
    }
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
    console.log('Solicitando reembolso...');
  }

  combineWithNewPayment(): void {
    console.log('Combinando con un nuevo pago...');
  }

  applyBalance(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.unmatchedPaymentResponse || !this.unmatchedPaymentResponse.unmatchedPayment.id) {
        this.errorMessage = 'No se puede aplicar el balance. Información de la cuenta faltante.';
        reject('Información faltante');
        return;
      }

      const balanceToApply = this.unmatchedPaymentResponse.difference;
      const refNumber = this.manualVerificationData.refNumber;

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
    console.log('Devolviendo la diferencia...');
  }

  adjustPayment(): void {
    console.log('Ajustando el pago al monto esperado...');
  }

  retryPayment() {
    console.log('Reintentando el pago...');
  }

  handleClose(): void {
    this.closeModal();
    if (this.transactionStatus === 'PENDING') {
      this.cancelTransaction(this.transactionNumber, this.orderRequestNumber);
    }
  }

  handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.transactionStatus === 'PENDING') {
      this.cancelTransaction(this.transactionNumber, this.orderRequestNumber);
    }
  }

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

  confirmEmailPrompt() {
    // Realizar la verificación después de ingresar el email
    this.showEmailPrompt = false;
    this.confirmVerification();
  }

  reloadPage(): void {
    window.location.reload();
  }

  isEmailValid(): boolean {
    // Validación simple de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.emailForKey);
  }

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
    if (this.transactionStatusSubscription){
      this.transactionStatusSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }
}
