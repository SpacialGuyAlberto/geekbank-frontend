// tigo-payment.component.ts

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { NgClass, NgIf } from "@angular/common";
import { CartItemWithGiftcard } from "../models/CartItem";
import { TigoService } from "../tigo.service";
import { WebSocketService } from "../web-socket.service";
import { Subscription } from "rxjs";
import { NotificationService } from "../services/notification.service";
import { TransactionsService } from "../transactions.service";
import { Transaction } from "../models/transaction.model";
import { AuthService } from "../auth.service";
import { GuestService } from "../guest.service";
import { Router } from "@angular/router";
import {CurrencyService} from "../currency.service";

@Component({
  selector: 'app-tigo-payment',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgClass
  ],
  templateUrl: './tigo-payment.component.html',
  styleUrls: ['./tigo-payment.component.css']
})
export class TigoPaymentComponent implements OnInit, OnDestroy {
  @Input() cartItems: CartItemWithGiftcard[] = [];
  @Input() totalPrice: number = 0;
  @Output() close = new EventEmitter<void>();
  @Input() productId: number | null = null;
  @Input() gameUserId: number | null = null;

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
  transactionNumber: string = '';
  orderRequestNumber: string = '';
  isCancelling: boolean = false;
  tigoImageUrl: string = 'https://i0.wp.com/logoroga.com/wp-content/uploads/2013/11/tigo-money-01.png?fit=980%2C980&ssl=1';
  isManualTransaction: boolean = false;
  tempPin: string = '';

  // Nuevas variables para manejo de verificación
  verifyTransactionSubscription: Subscription | null = null;
  showVerificationForm: boolean = false;
  verificationMessage: string = '';
  verificationData = {
    pin: '',
    refNumber: ''
  };

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
    console.log('Received cartItems:', this.cartItems);
    console.log('Received product ID:', this.productId);

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

    this.webSocketService.connect();

    this.verifyTransactionSubscription = this.webSocketService
      .subscribeToVerifyTransaction(this.paymentDetails.phoneNumber)
      .subscribe((message: any) => {
        console.log('Verification request received:', message);
        this.verificationMessage = message.message;
        this.showVerificationForm = true;
        this.showSpinner = false; // Ocultar spinner si estaba activo
      });
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

  onSubmit(): void {
    this.showSpinner = true;
    let orderDetails: any;

    if (this.productId !== null) {
      orderDetails = {
        userId: this.userId,
        guestId: this.guestId,
        phoneNumber: this.paymentDetails.phoneNumber,
        products: [{
          kinguinId: this.productId,
          qty: 1,
          price: this.totalPrice
        }],
        amount: this.totalPrice,
        manual: true
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
            price: item.giftcard.price
          })),
          amount: this.cartItems.reduce((total, item) => total + item.giftcard.price * item.cartItem.quantity, 0),
          manual: false
        };
      } else {
        orderDetails = {
          userId: this.userId,
          phoneNumber: this.paymentDetails.phoneNumber,
          products: [{
            kinguinId: -1,
            qty: 1,
            price: this.totalPrice,
            name: 'balance'
          }],
          amount: this.totalPrice,
          manual: false
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
            price: item.giftcard.price
          })),
          amount: this.cartItems.reduce((total, item) => total + item.giftcard.price * item.cartItem.quantity, 0),
          manual: false
        };
      } else {
        orderDetails = {
          guestId: this.guestId,
          phoneNumber: this.paymentDetails.phoneNumber,
          products: [{
            kinguinId: -1,
            qty: 1,
            price: this.totalPrice,
            name: 'balance'
          }],
          amount: this.totalPrice,
          manual: false
        };
      }
    } else {
      this.showSpinner = false;
      return;
    }

    console.log('Order Details:', orderDetails);

    this.tigoService.placeOrder(orderDetails).subscribe(
      response => {
        console.log('Order placed successfully', response);
        this.showConfirmation = true;

        const regex = /Order placed successfully: ([A-Z]+-\d+)\s+Transaction number: ([A-Z]+-\d+)\s+PIN\s*:?(\d{4})/;

        const matches = response.match(regex);

        if (matches && matches.length === 4) {
          this.orderRequestNumber = matches[1];
          this.transactionNumber = matches[2];
          this.tempPin = matches[3];

          console.log('Order Request Number:', this.orderRequestNumber);
          console.log('Transaction Number:', this.transactionNumber);
          console.log('Temporary PIN:', this.tempPin);

          this.verifyTransactionSubscription = this.webSocketService
            .subscribeToVerifyTransaction(this.paymentDetails.phoneNumber)
            .subscribe((message: any) => {
              console.log('Verification request received:', message);
              this.verificationMessage = message.message;
              this.showVerificationForm = true;
              this.showSpinner = false; // Ocultar spinner si estaba activo
            });

        } else {
          console.error('Error parsing response:', response);
          this.errorMessage = 'No se pudo obtener el PIN temporal. Por favor, intente nuevamente.';
          this.notificationService.addNotification(this.errorMessage, this.tigoImageUrl);
          this.showSpinner = false;
          return;
        }

        this.transactionSubscription = this.webSocketService
          .subscribeToTransactionStatus(this.paymentDetails.phoneNumber)
          .subscribe((message: any) => {
            console.log('Transaction status received:', message);
            this.transactionStatus = message.status;

            if (this.transactionStatus === 'COMPLETED') {
              this.notifMessage = 'Tu pago fue exitoso.';
              this.notificationService.addNotification(this.notifMessage, this.tigoImageUrl);
              console.log('Transaction completed');
              this.showSpinner = false;

              this.transactionService.setTransactionNumber(this.transactionNumber);

              // Redirigir a la página de confirmación de compra
              this.router.navigate(['/purchase-confirmation'], { queryParams: { transactionNumber: this.transactionNumber } });

            } else if (this.transactionStatus === 'FAILED') {
              this.notifMessage = 'Tu pago falló: ' + message.message;
              this.notificationService.addNotification(this.notifMessage, this.tigoImageUrl);
              console.error('Transaction failed:', message.message);
              this.showSpinner = false;
            } else if (this.transactionStatus === 'CANCELLED') {
              this.notifMessage = 'Tu pago fue cancelado.';
              this.notificationService.addNotification(this.notifMessage, this.tigoImageUrl);
              console.error('Transaction cancelled');
              this.showSpinner = false;
            } else if (this.transactionStatus === 'AWAITING_MANUAL_PROCESSING') {
              this.notifMessage = 'Tu pago está en espera de procesamiento manual.';
              this.notificationService.addNotification(this.notifMessage, this.tigoImageUrl);
              this.showSpinner = false;
            }
          });

      },
      error => {
        console.error('Error placing order', error);
        this.showSpinner = false;
      }
    );
  }

  submitVerification(): void {
    // Validar que los campos no estén vacíos
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
          this.showSpinner = false
        },
        error => {
          console.error('Verification error:', error);
          this.errorMessage = 'Error al verificar la transacción. Por favor, inténtelo nuevamente.';
        }
      );
  }

  cancelTransaction(transactionNumber: string, orderRequestId: string): void {
    this.isCancelling = true;

    this.transactionService.cancelTransaction(transactionNumber, orderRequestId)
      .subscribe(
        (updatedTransaction: Transaction) => {
          this.transaction = updatedTransaction;
          this.transactionStatus = 'CANCELLED';
          this.notifMessage = 'Tu pago fue cancelado.';
          console.log('Transaction cancelled:', updatedTransaction);
          this.isCancelling = false;
          this.showSpinner = false;
        },
        (error: any) => {
          this.errorMessage = 'Error al cancelar la transacción.';
          console.error('Error cancelling the transaction:', error);
          this.isCancelling = false;
          this.showSpinner = false;
        }
      );
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
    this.webSocketService.disconnect();
  }

  retryPayment() {

  }
}
