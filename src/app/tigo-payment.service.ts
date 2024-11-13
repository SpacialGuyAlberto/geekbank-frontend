// tigo-payment.service.ts
import { Injectable } from '@angular/core';
import { PaymentMethod } from './models/payment-method.interface';
import { OrderDetails } from './models/order-details.model';
import { Router } from '@angular/router';
import { TigoService } from './tigo.service';
import { WebSocketService } from './web-socket.service';
import { NotificationService } from './services/notification.service';
import { TransactionsService } from './transactions.service';
import { Subject } from 'rxjs';

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

    this.tigoService.placeOrder(orderDetails).subscribe(
      response => {
        console.log('Order placed successfully', response);

        const regex = /Order placed successfully: ([A-Z0-9-]+)\s+Transaction number: ([A-Z0-9-]+)\s+PIN\s*:?(\d{4})\s+Status\s*:?([A-Z]+)/;
        const matches = response.match(regex);

        if (matches && matches.length === 5) {
          const orderRequestNumber = matches[1];
          const transactionNumber = matches[2];
          const tempPin = matches[3];
          const status = matches[4];

          console.log('Order Request Number:', orderRequestNumber);
          console.log('Transaction Number:', transactionNumber);
          console.log('Temporary PIN: ', tempPin);
          console.log('Transaction: ', status)

          this.tempPinSubject.next(tempPin);
          this.transactionService.setTransactionNumber(transactionNumber);
          this.orderRequestIdSubject.next(orderRequestNumber);
          this.transactionStatusSubject.next(status);

          this.webSocketService.subscribeToVerifyTransaction(orderDetails.phoneNumber).subscribe((message: any) => {
            console.log('Verification request received:', message);
            this.verificationRequestSubject.next(message);
            this.showSpinnerSubject.next(false);
            this.showVerificationFormSubject.next(true);
            this.notificationService.addNotification(message.message, 'https://i0.wp.com/logoroga.com/wp-content/uploads/2013/11/tigo-money-01.png?fit=980%2C980&ssl=1');
          });

          this.webSocketService.subscribeToTransactionStatus(orderDetails.phoneNumber).subscribe((message: any) => {
            console.log('Transaction status received:', message);
            const transactionStatus = message.status;

            this.transactionStatusSubject.next(transactionStatus);

            if (transactionStatus === 'COMPLETED') {
              this.notificationService.addNotification('Tu pago fue exitoso.', 'https://i0.wp.com/logoroga.com/wp-content/uploads/2013/11/tigo-money-01.png?fit=980%2C980&ssl=1');
              this.transactionService.setTransactionNumber(transactionNumber);
              this.router.navigate(['/purchase-confirmation'], { queryParams: { transactionNumber } });
              this.showSpinnerSubject.next(false);
            } else if (transactionStatus === 'FAILED') {
              this.notificationService.addNotification(`Tu pago falló: ${message.message}`, 'https://i0.wp.com/logoroga.com/wp-content/uploads/2013/11/tigo-money-01.png?fit=980%2C980&ssl=1');
              this.showSpinnerSubject.next(false);
            } else if (transactionStatus === 'CANCELLED') {
              this.notificationService.addNotification('Tu pago fue cancelado.', 'https://i0.wp.com/logoroga.com/wp-content/uploads/2013/11/tigo-money-01.png?fit=980%2C980&ssl=1');
              this.showSpinnerSubject.next(false);
            } else if (transactionStatus === 'AWAITING_MANUAL_PROCESSING') {
              this.notificationService.addNotification('Tu pago está en espera de procesamiento manual.', 'https://i0.wp.com/logoroga.com/wp-content/uploads/2013/11/tigo-money-01.png?fit=980%2C980&ssl=1');
              this.showSpinnerSubject.next(false);
            } else if (transactionStatus === 'EXPIRED'){
              this.notificationService.addNotification('La transaccion generada ya expiro.', 'https://i0.wp.com/logoroga.com/wp-content/uploads/2013/11/tigo-money-01.png?fit=980%2C980&ssl=1')
              this.showSpinnerSubject.next(false);
            }
          });
        } else {
          console.error('Error parsing response:', response);
          this.notificationService.addNotification('No se pudo obtener el PIN temporal. Por favor, intente nuevamente.', 'https://i0.wp.com/logoroga.com/wp-content/uploads/2013/11/tigo-money-01.png?fit=980%2C980&ssl=1');
          this.errorMessageSubject.next('No se pudo obtener el PIN temporal. Por favor, intente nuevamente.');
          this.showSpinnerSubject.next(false);
        }
      },
      error => {
        console.error('Error placing order', error);
        this.notificationService.addNotification('Error al procesar el pedido. Por favor, inténtelo nuevamente.', 'https://i0.wp.com/logoroga.com/wp-content/uploads/2013/11/tigo-money-01.png?fit=980%2C980&ssl=1');
        this.errorMessageSubject.next('Error al procesar el pedido. Por favor, inténtelo nuevamente.');
        this.showSpinnerSubject.next(false);
      }
    );
  }
}
