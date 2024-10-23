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
    this.showSpinner = true; // Mostrar spinner al hacer clic en Pay
    let orderDetails: any;

    if (this.authService.isLoggedIn() && this.userId !== null) {
      // Usuario autenticado: enviar userId
      if (this.cartItems && this.cartItems.length > 0) {
        // Si hay productos en el carrito
        orderDetails = {
          userId: this.userId,
          phoneNumber: this.paymentDetails.phoneNumber,

          products: this.cartItems.map(item => ({
            kinguinId: item.cartItem.productId,
            qty: item.cartItem.quantity,
            price: item.giftcard.price
          })),
          amount: this.totalPrice
        };

      } else {
        // Si no hay productos, se asume que es una compra de balance
        orderDetails = {
          userId: this.userId,
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
    } else if (this.guestId) {
      // Usuario invitado: enviar guestId
      if (this.cartItems && this.cartItems.length > 0) {
        // Si hay productos en el carrito
        orderDetails = {
          guestId: this.guestId,
          phoneNumber: this.paymentDetails.phoneNumber,
          products: this.cartItems.map(item => ({
            kinguinId: item.cartItem.productId,
            qty: item.cartItem.quantity,
            price: item.giftcard.price
          })),
          amount: this.totalPrice
        };

        this.cartItems.forEach(item => {
          console.log(`Preparing order for product ${item.cartItem.productId} with Kinguin ID: ${item.giftcard.kinguinId}`);
        });

      } else {
        // Si no hay productos, se asume que es una compra de balance
        orderDetails = {
          guestId: this.guestId,
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
    } else {
      // Caso extremo: ni userId ni guestId están disponibles
      this.showSpinner = false;
      // this.snackBar.open('Error: No se encontró el usuario ni invitado.', 'Cerrar', {
      //   duration: 3000,
      // });
      return;
    }

    console.log('Order Details:', orderDetails); // Para depuración

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

              // Redirigir al usuario a la página de confirmación de compra
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
