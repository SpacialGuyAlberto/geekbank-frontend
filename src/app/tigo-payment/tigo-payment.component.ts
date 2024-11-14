// tigo-payment.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { CartItemWithGiftcard } from "../models/CartItem";
import { TigoService } from "../tigo.service";
import { WebSocketService } from "../web-socket.service";
import { Subscription, take } from "rxjs";
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

@Component({
  selector: 'app-tigo-payment',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgClass,
    NgForOf
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

  unmatchedPaymentResponse: UnmatchedPaymentResponseDto | null = null;

  @Output() close = new EventEmitter<void>();

  notifMessage: string = '';
  showModal: boolean = true;
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

  // Nuevas variables para manejo de verificación
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

  constructor(
    private tigoService: TigoService,
    private tigoPaymentService: TigoPaymentService,
    private paymentService: PaymentService,
    private currencyService: CurrencyService,
    private webSocketService: WebSocketService,
    private notificationService: NotificationService,
    private transactionService: TransactionsService,
    private authService: AuthService,
    private guestService: GuestService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadExchangeRate();
    this.paymentDetails.total = this.totalPrice;
    console.log('Received product ID:', this.productId?.toString());
    console.log('Received total price: ', this.totalPrice);

    if (this.authService.isLoggedIn()) {
      const storedUserId = sessionStorage.getItem("userId");
      if (storedUserId) {
        this.userId = parseInt(storedUserId, 10);
        if (isNaN(this.userId)) {
          console.error('Invalid userId in sessionStorage:', storedUserId);
          this.userId = null;
        }
      } else {
        console.error('No userId found in sessionStorage.');
        this.userId = null;
      }
    } else {
      this.guestId = this.guestService.getGuestId();
    }

    this.spinnerSubscription = this.tigoPaymentService.showSpinner$.subscribe(show => {
      this.showSpinner = show;
    });

    this.transactionNumberSubscription = this.transactionService.transactionNumber$.subscribe(transactionNumber => {
      this.transactionNumber = transactionNumber;
    });

    this.orderRequestIdSubscription = this.tigoPaymentService.orderRequestId$.subscribe(orderRequestId => {
      this.orderRequestNumber = orderRequestId;
    });

    this.verificationFormSubscription = this.tigoPaymentService.showVerificationForm$.subscribe(show => {
      this.showVerificationForm = show;
    });

    this.transactionStatusSubscription = this.tigoPaymentService.transactionStatus$.subscribe(status => {
      this.transactionStatus = status;
    });

    this.tempPinSubscription = this.tigoPaymentService.tempPin$.subscribe(pin => {
      this.tempPin = pin;
      this.showConfirmation = true;
    });

    this.errorMessageSubscription = this.tigoPaymentService.errorMessage$.subscribe(message => {
      this.errorMessage = message;
    });

    this.verifyTransactionSubscription = this.tigoPaymentService.verificationRequest$.subscribe(message => {
      this.verificationMessage = message;
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
    this.unmatchedPaymentResponse = null; // Limpiar respuesta previa si la hay
  }

  loadExchangeRate(): void {
    this.isLoading = true;
    this.exchangeRateSubscription = this.currencyService.getExchangeRateEURtoHNL(1).subscribe({
      next: (rate) => {
        this.exchangeRate = rate;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener la tasa de cambio:', err);
        this.conversionError = 'No se pudo cargar la tasa de cambio. Inténtelo más tarde.';
        this.isLoading = false;
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.close.emit();
  }

  submitManualVerification(): void {
    if (!this.manualVerificationData.refNumber) {
      this.manualVerificationError = 'Por favor, ingrese el número de referencia.';
      return;
    }

    const refNumber = this.manualVerificationData.refNumber;
    const phoneNumber = this.paymentDetails.phoneNumber; // Asegúrate de que este campo esté correctamente asignado

    // Construir el OrderDetails basado en tu lógica existente
    let orderDetails: OrderRequest;

    if (this.productId !== null) {
      orderDetails = {
        userId: this.userId,
        guestId: this.guestId,
        phoneNumber: this.paymentDetails.phoneNumber,
        products: [{
          kinguinId: this.productId,
          qty: 1,
          price: this.totalPrice,
          name: 'Producto'
        }],
        amount: this.totalPrice,
        manual: this.isManualTransaction,
      };
    } else if (this.authService.isLoggedIn() && this.userId !== null) {
      if (this.cartItems && this.cartItems.length > 0) {
        orderDetails = {
          userId: this.userId,
          phoneNumber: this.paymentDetails.phoneNumber,
          products: this.cartItems.map(item => ({
            kinguinId: item.cartItem.productId,
            qty: item.cartItem.quantity,
            price: item.giftcard.price,
            name: 'Producto'
          })),
          amount: this.cartItems.reduce((total, item) => total + item.giftcard.price * item.cartItem.quantity, 0),
          manual: this.isManualTransaction,
        };
      } else {
        orderDetails = {
          userId: this.userId,
          phoneNumber: this.paymentDetails.phoneNumber,
          products: [{
            kinguinId: -1,
            qty: 1,
            price: this.totalPrice,
            name: 'Balance'
          }],
          amount: this.totalPrice,
          manual: this.isManualTransaction,
        };
      }
    } else if (this.guestId) {
      if (this.cartItems && this.cartItems.length > 0) {
        orderDetails = {
          guestId: this.guestId,
          phoneNumber: this.paymentDetails.phoneNumber,
          products: this.cartItems.map(item => ({
            kinguinId: item.cartItem.productId,
            qty: item.cartItem.quantity,
            price: item.giftcard.price,
            name: 'Producto'
          })),
          amount: this.cartItems.reduce((total, item) => total + item.giftcard.price * item.cartItem.quantity, 0),
          manual: this.isManualTransaction,
        };
      } else {
        orderDetails = {
          guestId: this.guestId,
          phoneNumber: this.paymentDetails.phoneNumber,
          products: [{
            kinguinId: -1,
            qty: 1,
            price: this.totalPrice,
            name: 'Balance'
          }],
          amount: this.totalPrice,
          manual: this.isManualTransaction,
        };
      }
    } else {
      this.showSpinner = false;
      return;
    }

    // Calcula el monto esperado ajustado con la tasa de cambio
    const expectedAmount = this.totalPrice * this.exchangeRate;

    this.verifyUnmatchedPayment(refNumber, phoneNumber, expectedAmount);
  }

  verifyUnmatchedPayment(referenceNumber: string, phoneNumber: string, expectedAmount: number): void {
    this.transactionService.verifyUnmatchedPaymentAmount(referenceNumber, phoneNumber, expectedAmount).subscribe({
      next: (response) => {
        this.unmatchedPaymentResponse = response;
        console.log('Unmatched Payment Response:', response);
      },
      error: (error) => {
        console.error('Error al verificar el monto de pago no coincidente:', error);
        this.manualVerificationError = error.error?.message || 'Error al verificar el pago. Por favor, inténtelo nuevamente.';
      }
    });
  }

  handleOptionSelection(option: string): void {
    console.log('Opción seleccionada:', option);
    // Implementar lógica según la opción elegida
    // Por ejemplo:
    switch (option) {
      case 'Quiero mi dinero de nuevo':
        this.requestRefund();
        break;
      case 'Combinar este pago con otro nuevo pago':
        this.combineWithNewPayment();
        break;
      case 'Apply the difference as a balance':
        this.applyBalance();
        break;
      case 'Return the difference':
        this.returnDifference();
        break;
      case 'Adjust the payment to match the expected amount':
        this.adjustPayment();
        break;
      default:
        console.warn('Opción no reconocida:', option);
    }
  }

  // Métodos para manejar cada opción
  requestRefund(): void {
    // Implementar lógica para solicitar reembolso
    console.log('Solicitando reembolso...');
    // Aquí podrías llamar a un servicio backend para procesar el reembolso
  }

  combineWithNewPayment(): void {
    // Implementar lógica para combinar con un nuevo pago
    console.log('Combinando con un nuevo pago...');
    // Aquí podrías redirigir al usuario para realizar un nuevo pago
  }

  applyBalance(): void {
    // Implementar lógica para aplicar la diferencia como balance
    console.log('Aplicando la diferencia como balance...');
    // Aquí podrías actualizar el balance del usuario
  }

  returnDifference(): void {
    // Implementar lógica para devolver la diferencia
    console.log('Devolviendo la diferencia...');
    // Aquí podrías llamar a un servicio backend para procesar la devolución
  }

  adjustPayment(): void {
    // Implementar lógica para ajustar el pago al monto esperado
    console.log('Ajustando el pago al monto esperado...');
    // Aquí podrías actualizar la transacción para reflejar el ajuste
  }

  onSubmit(): void {
    let orderDetails: OrderRequest;

    if (this.productId !== null) {
      orderDetails = {
        userId: this.userId,
        guestId: this.guestId,
        phoneNumber: this.paymentDetails.phoneNumber,
        products: [{
          kinguinId: this.productId,
          qty: 1,
          price: this.totalPrice,
          name: 'Producto'
        }],
        amount: this.totalPrice,
        manual: this.isManualTransaction
      };

      if (this.gameUserId !== null) {
        orderDetails.gameUserId = this.gameUserId;
      }
    } else if (this.authService.isLoggedIn() && this.userId !== null) {
      if (this.cartItems && this.cartItems.length > 0) {
        orderDetails = {
          userId: this.userId,
          phoneNumber: this.paymentDetails.phoneNumber,
          products: this.cartItems.map(item => ({
            kinguinId: item.cartItem.productId,
            qty: item.cartItem.quantity,
            price: item.giftcard.price,
            name: 'Producto'
          })),
          amount: this.cartItems.reduce((total, item) => total + item.giftcard.price * item.cartItem.quantity, 0),
          manual: this.isManualTransaction
        };
      } else {
        orderDetails = {
          userId: this.userId,
          phoneNumber: this.paymentDetails.phoneNumber,
          products: [{
            kinguinId: -1,
            qty: 1,
            price: this.totalPrice,
            name: 'Balance'
          }],
          amount: this.totalPrice,
          manual: this.isManualTransaction
        };
      }
    } else if (this.guestId) {
      if (this.cartItems && this.cartItems.length > 0) {
        orderDetails = {
          guestId: this.guestId,
          phoneNumber: this.paymentDetails.phoneNumber,
          products: this.cartItems.map(item => ({
            kinguinId: item.cartItem.productId,
            qty: item.cartItem.quantity,
            price: item.giftcard.price,
            name: 'Producto'
          })),
          amount: this.cartItems.reduce((total, item) => total + item.giftcard.price * item.cartItem.quantity, 0),
          manual: this.isManualTransaction
        };
      } else {
        orderDetails = {
          guestId: this.guestId,
          phoneNumber: this.paymentDetails.phoneNumber,
          products: [{
            kinguinId: -1,
            qty: 1,
            price: this.totalPrice,
            name: 'Balance'
          }],
          amount: this.totalPrice,
          manual: this.isManualTransaction
        };
      }
    } else {
      this.showSpinner = false;
      return;
    }

    console.log('Order Details:', orderDetails);

    this.paymentService.initializePayment('tigo', orderDetails);
  }

  submitVerification(): void {

    if (!this.verificationData.pin || !this.verificationData.refNumber) {
      this.errorMessage = 'Por favor, ingrese su PIN y número de referencia.';
      return;
    }

    this.transactionService.verifyTransaction(this.paymentDetails.phoneNumber, this.verificationData.pin, this.verificationData.refNumber)
      .subscribe(
        response => {
          console.log('Verification successful:', response);
          this.showVerificationForm = false;
          this.showConfirmation = false;
          this.showSpinner = false;
        },
        error => {
          console.error('Verification error:', error);
          this.errorMessage = 'Error al verificar la transacción. Por favor, inténtelo nuevamente.';
        }
      );
  }

  cancelTransaction(transactionNumber: string | null, orderRequestId: string): void {
    this.isCancelling = true;
    console.log('TRANSACTION STATUS' + this.transactionStatus)

    this.transactionService.cancelTransaction(transactionNumber, orderRequestId)
      .pipe(take(1))
      .subscribe({
        next: (updatedTransaction: Transaction) => {
          this.transaction = updatedTransaction;
          this.transactionStatus = 'CANCELLED';
          this.notifMessage = 'Tu pago fue cancelado.';
          console.log('Transaction cancelled:', updatedTransaction);
          this.isCancelling = false;
          this.showSpinner = false;
        },
        error: (error: any) => {
          this.errorMessage = 'Error al cancelar la transacción.';
          console.error('Error cancelling the transaction:', error);
          this.isCancelling = false;
          this.showSpinner = false;
        }
      });
  }

  retryPayment() {
    // Implementar lógica para reintentar el pago
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
