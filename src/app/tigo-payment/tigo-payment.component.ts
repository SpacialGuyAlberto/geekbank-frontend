import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { NgIf } from "@angular/common";
import { CartItemWithGiftcard } from "../models/CartItem";
import { TigoService } from "../tigo.service";
import {WebSocketService} from "../web-socket.service";
import {Subscription} from "rxjs";
import {response} from "express";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {NotificationService} from "../services/notification.service";

@Component({
  selector: 'app-tigo-payment',
  standalone: true,
  imports: [
    FormsModule,
    NgIf
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
  transactionStatus: string = '';  // Nueva variable para el estado de la transacción
  transactionSubscription: Subscription | null = null;
  tigoImageUrl: string = 'https://i0.wp.com/logoroga.com/wp-content/uploads/2013/11/tigo-money-01.png?fit=980%2C980&ssl=1';

  paymentDetails = {
    name: '',
    address: '',
    phoneNumber: '',
    total: 0
  };
  userId: string | null = '';

  constructor(private tigoService: TigoService, private webSocketService: WebSocketService, private notificationService: NotificationService) { }

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
    const orderDetails = {
      userId: parseInt(<string>sessionStorage.getItem("userId")),
      phoneNumber: this.paymentDetails.phoneNumber,
      products: this.cartItems.map(item => ({
        kinguinId: item.giftcard.kinguinId,
        qty: item.cartItem.quantity,
        price: item.giftcard.price
      })),
      amount: this.totalPrice
    };

    this.tigoService.placeOrder(orderDetails).subscribe(
      response => {
        console.log('Order placed successfully', response);
        this.showConfirmation = true;

        this.transactionSubscription = this.webSocketService
          .subscribeToTransactionStatus(this.paymentDetails.phoneNumber)
          .subscribe(status => {
            console.log('Transaction status received:', status);
            this.transactionStatus = status;  // Actualizar el estado de la transacción

            if (status === 'COMPLETED') {
              this.notifMessage = 'Your payment was successfull';
              this.notificationService.addNotification(this.notifMessage, this.tigoImageUrl);
              console.log('Transaction completed');
              this.showSpinner = false;  // Ocultar el spinner
            } else if (status === 'CANCELLED') {
              this.notifMessage = 'Your payment was not successfull';
              this.notificationService.addNotification(this.notifMessage, this.tigoImageUrl);
              console.error('Transaction cancelled');
              this.showSpinner = false;  // Ocultar el spinner
            }
          });
      },
      error => {
        console.error('Error placing order', error);
        this.showSpinner = false; // Ocultar spinner en caso de error
      }
    );
  }

  ngOnDestroy(): void {
    // Desconectar el WebSocket al destruir el componente
    if (this.transactionSubscription) {
      this.transactionSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }
}
