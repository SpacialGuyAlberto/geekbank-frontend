import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from "@angular/forms";
import {NgClass, NgIf} from "@angular/common";
import { CartItemWithGiftcard } from "../models/CartItem";
import { TigoService } from "../tigo.service";
import {WebSocketService} from "../web-socket.service";
import {Observable, Subscription} from "rxjs";
import {response} from "express";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {NotificationService} from "../services/notification.service";
import {TransactionsService} from "../transactions.service";
import {Transaction} from "../models/transaction.model";
import {HttpHeaders} from "@angular/common/http";


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

  notifMessage: string = '';
  showModal: boolean = true;
  showConfirmation: boolean = false;
  showSpinner: boolean = false;
  transaction: Transaction | null = null;
  successMessage: string = '';
  errorMessage: string = '';
  transactionStatus: string = '';  // Nueva variable para el estado de la transacción
  transactionSubscription: Subscription | null = null;
  private transactionNumberSubscription: Subscription | null = null;
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
  userId: string | null = '';

  constructor(
    private tigoService: TigoService,
    private webSocketService: WebSocketService,
    private notificationService: NotificationService,
    private transactionService: TransactionsService,
  ) { }

  ngOnInit(): void {
    this.paymentDetails.total = this.totalPrice;
    this.userId = sessionStorage.getItem("userId");
    console.log(' USER ID: ' + this.userId);
    this.webSocketService.connect();
  }

  closeModal(): void {
    this.showModal = false;
    this.close.emit();
  }

  onSubmit(): void {
    this.showSpinner = true; // Mostrar spinner al hacer clic en Pay
    let orderDetails: any;
    // const orderDetails = {
    //   userId: parseInt(<string>sessionStorage.getItem("userId")),
    //   phoneNumber: this.paymentDetails.phoneNumber,
    //   products: this.cartItems.map(item => ({
    //     kinguinId: item.giftcard.kinguinId,
    //     qty: item.cartItem.quantity,
    //     price: item.giftcard.price
    //   })),
    //   amount: this.totalPrice
    // };

    if (this.cartItems && this.cartItems.length > 0) {
      // Caso de compra de productos
      orderDetails = {
        userId: parseInt(<string>sessionStorage.getItem("userId")),
        phoneNumber: this.paymentDetails.phoneNumber,
        products: this.cartItems.map(item => ({
          kinguinId: item.giftcard.kinguinId,
          qty: item.cartItem.quantity,
          price: item.giftcard.price
        })),
        amount: this.totalPrice
      };
    } else {
      // Caso de compra de balance
      orderDetails = {
        userId: parseInt(<string>sessionStorage.getItem("userId")),
        phoneNumber: this.paymentDetails.phoneNumber,
        products: [
          {
            kinguinId: -1, // ID especial para balance
            qty: 1,
            price: this.totalPrice,
            name: 'balance' // Identificador del producto como balance
          }
        ],
        amount: this.totalPrice
      };
    }

    this.tigoService.placeOrder(orderDetails).subscribe(
      response => {
        console.log('Order placed successfully', response);
        this.showConfirmation = true;

        const regex = /Order placed successfully: ([A-Z]+-\d+)\s+Transaction number: ([A-Z]+-\d+)/;
        const matches = response.match(regex);

        if (matches && matches.length === 3) {
          this.orderRequestNumber = matches[1];  // Captura ORQ-xxxxxxxxxxxx
          this.transactionNumber = matches[2];   // Captura TX-xxxxxxxxxxxx
          console.log('Order Request Number:', this.orderRequestNumber);
          console.log('Transaction Number:', this.transactionNumber);
        } else {
          console.error('Error parsing response:', response);
        }

// En el componente donde suscribes al WebSocket
        this.transactionSubscription = this.webSocketService
          .subscribeToTransactionStatus(this.paymentDetails.phoneNumber)
          .subscribe((message: any) => {
            console.log('Transaction status received:', message);
            this.transactionStatus = message.status;  // Actualizar el estado de la transacción

            if (this.transactionStatus === 'COMPLETED') {
              this.notifMessage = 'Your payment was successful';
              this.notificationService.addNotification(this.notifMessage, this.tigoImageUrl);
              console.log('Transaction completed');
              this.showSpinner = false;  // Ocultar el spinner
            } else if (this.transactionStatus === 'FAILED') {
              this.notifMessage = 'Your payment failed: ' + message.reason;
              this.notificationService.addNotification(this.notifMessage, this.tigoImageUrl);
              console.error('Transaction failed:', message.reason);
              this.showSpinner = false;  // Ocultar el spinner
            } else if (this.transactionStatus === 'CANCELLED') {
              this.notifMessage = 'Your payment was not successful';
              this.notificationService.addNotification(this.notifMessage, this.tigoImageUrl);
              console.error('Transaction cancelled');
              this.showSpinner = false;  // Ocultar el spinner
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

  }
}
