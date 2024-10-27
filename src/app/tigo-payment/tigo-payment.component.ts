// src/app/tigo-payment/tigo-payment.component.ts
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
import { OrderRequest } from "../models/order-request.model";
import {Router} from "@angular/router"; // Importar la interfaz

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

  paymentDetails = {
    name: '',
    address: '',
    phoneNumber: '',
    total: 0
  };
  userId: number | null = null; // Puede ser null o un número
  guestId: string | null = null;

  constructor(
    private tigoService: TigoService,
    private webSocketService: WebSocketService,
    private notificationService: NotificationService,
    private transactionService: TransactionsService,
    private authService: AuthService,
    private guestService: GuestService,
    private router: Router // Inyectar Router
  ) { }

  ngOnInit(): void {
    this.paymentDetails.total = this.totalPrice;
    console.log('Received cartItems:', this.cartItems);
    console.log('Received product ID:', this.productId);

    if (this.authService.isLoggedIn()) {
      const storedUserId = sessionStorage.getItem("userId");
      if (storedUserId) {
        this.userId = parseInt(storedUserId, 10);
        if (isNaN(this.userId)) {
          console.error('Invalid userId in sessionStorage:', storedUserId);
          this.userId = null; // Asignar null si la conversión falla
        }
      } else {
        console.error('No userId found in sessionStorage.');
        this.userId = null;
      }
    } else {
      this.guestId = this.guestService.getGuestId(); // Obtener guestId de GuestService
    }

    console.log('USER ID:', this.userId);
    console.log('GUEST ID:', this.guestId);
    this.webSocketService.connect();
  }

  closeModal(): void {
    this.showModal = false;
    this.close.emit();
  }

  onSubmit(): void {
    this.showSpinner = true; // Show spinner when clicking Pay
    let orderDetails: any;

    // Check if productId is available for direct purchase
    if (this.productId !== null) {
      orderDetails = {
        userId: this.userId, // Use userId if authenticated
        guestId: this.guestId, // Use guestId if applicable
        phoneNumber: this.paymentDetails.phoneNumber,
        products: [{
          kinguinId: this.productId, // Use the passed product ID for direct purchase
          qty: 1, // Fixed to 1 for direct purchase
          price: this.totalPrice // Use the passed price
        }],
        amount: this.totalPrice // Total amount for the order
      };

      if (this.gameUserId !== null) {
        orderDetails.gameUserId = this.gameUserId; // Add gameUserId to order details
      }
    } else if (this.authService.isLoggedIn() && this.userId !== null) {
      // User is authenticated and trying to purchase from cart
      if (this.cartItems && this.cartItems.length > 0) {
        orderDetails = {
          userId: this.userId,
          phoneNumber: this.paymentDetails.phoneNumber,
          products: this.cartItems.map(item => ({
            kinguinId: item.cartItem.productId,
            qty: item.cartItem.quantity,
            price: item.giftcard.price
          })),
          amount: this.cartItems.reduce((total, item) => total + item.giftcard.price * item.cartItem.quantity, 0) // Total amount from cart
        };
      } else {
        // Handle case for balance purchase
        orderDetails = {
          userId: this.userId,
          phoneNumber: this.paymentDetails.phoneNumber,
          products: [{
            kinguinId: -1, // ID for balance purchase
            qty: 1,
            price: this.totalPrice,
            name: 'balance'
          }],
          amount: this.totalPrice
        };
      }
    } else if (this.guestId) {
      // Guest user
      if (this.cartItems && this.cartItems.length > 0) {
        orderDetails = {
          guestId: this.guestId,
          phoneNumber: this.paymentDetails.phoneNumber,
          products: this.cartItems.map(item => ({
            kinguinId: item.cartItem.productId,
            qty: item.cartItem.quantity,
            price: item.giftcard.price
          })),
          amount: this.cartItems.reduce((total, item) => total + item.giftcard.price * item.cartItem.quantity, 0) // Total amount from cart
        };
      } else {
        // Handle case for balance purchase
        orderDetails = {
          guestId: this.guestId,
          phoneNumber: this.paymentDetails.phoneNumber,
          products: [{
            kinguinId: -1, // ID for balance purchase
            qty: 1,
            price: this.totalPrice,
            name: 'balance'
          }],
          amount: this.totalPrice
        };
      }
    } else {
      // Edge case: Neither userId nor guestId available
      this.showSpinner = false;
      return; // Stop execution
    }

    console.log('Order Details:', orderDetails); // For debugging

    // Proceed to place the order with the constructed orderDetails
    this.tigoService.placeOrder(orderDetails).subscribe(
      response => {
        console.log('Order placed successfully', response);
        this.showConfirmation = true;

        const regex = /Order placed successfully: ([A-Z]+-\d+)\s+Transaction number: ([A-Z]+-\d+)/;
        const matches = response.match(regex);

        if (matches && matches.length === 3) {
          this.orderRequestNumber = matches[1];  // Capture order request number
          this.transactionNumber = matches[2];   // Capture transaction number
          console.log('Order Request Number:', this.orderRequestNumber);
          console.log('Transaction Number:', this.transactionNumber);
        } else {
          console.error('Error parsing response:', response);
        }

        this.transactionSubscription = this.webSocketService
          .subscribeToTransactionStatus(this.paymentDetails.phoneNumber)
          .subscribe((message: any) => {
            console.log('Transaction status received:', message);
            this.transactionStatus = message.status;

            if (this.transactionStatus === 'COMPLETED') {
              this.notifMessage = 'Your payment was successful';
              this.notificationService.addNotification(this.notifMessage, this.tigoImageUrl);
              console.log('Transaction completed');
              this.showSpinner = false;

              this.transactionService.setTransactionNumber(this.transactionNumber);

              // Redirect to purchase confirmation page
              this.router.navigate(['/purchase-confirmation'], { queryParams: { transactionNumber: this.transactionNumber } });

            } else if (this.transactionStatus === 'FAILED') {
              this.notifMessage = 'Your payment failed: ' + message.reason;
              this.notificationService.addNotification(this.notifMessage, this.tigoImageUrl);
              console.error('Transaction failed:', message.reason);
              this.showSpinner = false;
            } else if (this.transactionStatus === 'CANCELLED') {
              this.notifMessage = 'Your payment was not successful';
              this.notificationService.addNotification(this.notifMessage, this.tigoImageUrl);
              console.error('Transaction cancelled');
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



  cancelTransaction(transactionNumber: string, orderRequestId: string): void {
    this.isCancelling = true;

    this.transactionService.cancelTransaction(transactionNumber, orderRequestId)
      .subscribe(
        (updatedTransaction: Transaction) => {
          this.transaction = updatedTransaction;
          this.transactionStatus = 'CANCELLED';
          this.notifMessage = 'Your payment was cancelled.';
          console.log('Transaction cancelled:', updatedTransaction);
          this.isCancelling = false;
          this.showSpinner = false;
        },
        (error: any) => {
          this.errorMessage = 'Error cancelling the transaction.';
          console.error('Error cancelling the transaction:', error);
          this.isCancelling = false;
          this.showSpinner = false;
        }
      );
  }

  ngOnDestroy(): void {
    if (this.transactionSubscription) {
      this.transactionSubscription.unsubscribe();
    }
    if (this.transactionNumberSubscription) {
      this.transactionNumberSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }

  retryPayment() {
    // Implementa la lógica de reintento si es necesario
  }

  // Importa y utiliza MatSnackBa
}
