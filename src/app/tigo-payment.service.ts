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

  constructor(
    private tigoService: TigoService,
    private webSocketService: WebSocketService,
    private notificationService: NotificationService,
    private transactionService: TransactionsService,
    private router: Router
  ) { }

  initializePayment(orderDetails: OrderDetails): void {
    this.showSpinnerSubject.next(true);

    this.tigoService.placeOrder(orderDetails).subscribe(
      response => {
        console.log('Order placed successfully', response);
        // Parsear la respuesta y extraer información
        const regex = /Order placed successfully: ([A-Z]+-\d+)\s+Transaction number: ([A-Z]+-\d+)\s+PIN\s*:?(\d{4})/;
        const matches = response.match(regex);

        if (matches && matches.length === 4) {
          const orderRequestNumber = matches[1];
          const transactionNumber = matches[2];
          const tempPin = matches[3];

          console.log('Order Request Number:', orderRequestNumber);
          console.log('Transaction Number:', transactionNumber);
          console.log('Temporary PIN:', tempPin);

          // Emitir el tempPin al componente
          this.tempPinSubject.next(tempPin);

          // Suscribirse a la verificación de la transacción
          this.webSocketService.subscribeToVerifyTransaction(orderDetails.phoneNumber).subscribe((message: any) => {
            console.log('Verification request received:', message);

            // Emitir notificación o actualizar estado
            this.notificationService.addNotification(message.message, 'https://i0.wp.com/logoroga.com/wp-content/uploads/2013/11/tigo-money-01.png?fit=980%2C980&ssl=1');
          });

          // Suscribirse al estado de la transacción
          this.webSocketService.subscribeToTransactionStatus(orderDetails.phoneNumber).subscribe((message: any) => {
            console.log('Transaction status received:', message);
            const transactionStatus = message.status;

            // Emitir el estado de la transacción al componente
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
