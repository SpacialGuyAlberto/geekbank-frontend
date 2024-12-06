// tigo-payment.service.ts
import { Injectable } from '@angular/core';
import { PaymentMethod } from './models/payment-method.interface';
import { OrderDetails } from './models/order-details.model';
import { Router } from '@angular/router';
import { TigoService } from './tigo.service';
import { WebSocketService } from './web-socket.service';
import { NotificationService } from './services/notification.service';
import { TransactionsService } from './transactions.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {OrderRequest} from "./models/order-request.model";
import {Transaction} from "./models/transaction.model";

@Injectable({
  providedIn: 'root'
})
export class TigoPaymentService implements PaymentMethod {

  // Subjects para comunicar eventos y datos al componente
  private transactionStatusSubject = new Subject<string>();
  transactionStatus$ = this.transactionStatusSubject.asObservable();

  private tempPinSubject = new Subject<string>();
  tempPin$ = this.tempPinSubject.asObservable();

  private showSpinnerSubject = new Subject<boolean>();
  showSpinner$ = this.showSpinnerSubject.asObservable();

  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  private verificationRequestSubject = new Subject<any>();
  verificationRequest$ = this.verificationRequestSubject.asObservable();

  private showVerificationFormSubject = new Subject<boolean>();
  showVerificationForm$ = this.showVerificationFormSubject.asObservable();

  private orderRequestIdSubject = new Subject<string>();
  orderRequestId$ = this.orderRequestIdSubject.asObservable();

  private transactionSubject = new BehaviorSubject<Transaction | null>(null);
  transaction$ = this.transactionSubject.asObservable(); // Observable expuesto

  constructor(
    private tigoService: TigoService,
    private webSocketService: WebSocketService,
    private notificationService: NotificationService,
    private transactionService: TransactionsService,
    private router: Router

  ) {
    this.webSocketService.connect();
  }

  initializePayment(orderDetails: OrderDetails): void {
    this.showSpinnerSubject.next(true);
    this.tigoService.placeOrderForVerifiedPayment(orderDetails).subscribe(
      (transaction: Transaction) => {
        console.log('Transaction received:', transaction);
        this.transactionSubject.next(transaction);
        this.showSpinnerSubject.next(false);
      },
      error => {
        console.error('Error processing transaction:', error);
        this.notificationService.addNotification(
          'Error al procesar la transacción. Por favor, inténtelo nuevamente.',
          'https://i0.wp.com/logoroga.com/wp-content/uploads/2013/11/tigo-money-01.png?fit=980%2C980&ssl=1'
        );
        this.errorMessageSubject.next('Error al procesar la transacción. Por favor, inténtelo nuevamente.');
        this.showSpinnerSubject.next(false);
      }
    );
  }
}
