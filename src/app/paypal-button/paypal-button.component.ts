import {Component, OnInit, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import { loadScript, PayPalNamespace } from '@paypal/paypal-js';
import { PayPalService } from '../payment-options/pay-pal.service';
import {TransactionsService} from "../transactions/transactions.service";
import { OrderService } from '../services/order.service';
import { OrderRequest } from '../models/order-request.model';
import {firstValueFrom, Subscription} from 'rxjs';
import {WebSocketService} from "../services/web-socket.service";

@Component({
  selector: 'app-paypal-button',
  template: `
    <div id="paypal-button-container"></div>
  `,
  standalone: true,
})
export class PayPalButtonComponent implements OnInit, OnDestroy {
  @Input() amount: string | null = '';
  @Input() orderDetails?: OrderRequest;
  @Output() paymentSuccess = new EventEmitter<string>();
  @Output() paymentFailureKeysNotAvailable = new EventEmitter<string>()
  @Input() paymentSource: 'paypal' | 'venmo' | 'applepay' | 'itau' | 'credit' | 'paylater' | 'card' | 'ideal' | 'sepa' | 'bancontact' | 'giropay' = 'paypal';
  @Input() onSubmitOrder!: () => Promise<OrderRequest>;

  transactionStatus: string = '';
  showSpinner: boolean = false;
  private transactionStatusSubscription: Subscription | undefined;

  @Output() transactionCancelled = new EventEmitter<void>();

  constructor(
    private orderService: OrderService,
    private payPalService: PayPalService,
    private transactionService: TransactionsService,
    private webSocketService: WebSocketService
  ) {
    this.webSocketService.connect();
  }

  async ngOnInit() {
    const paypal: PayPalNamespace | null = await loadScript({
      clientId: 'AdSFKstNcV1wB1UZLGjxgdWoPAoRRxab0GueeSo34FBSmSjbchZErM7WPxBrE5u6CxRUNwtnOaq4eS1W',
    });

    if (!paypal) {
      console.error('PayPal SDK no se pudo cargar.');
      return;
    }

    await this.renderPayPalButton(paypal);

    this.transactionStatusSubscription = this.webSocketService.subscribeToTransactionStatus().subscribe(parsedMessage => {
      this.transactionStatus = parsedMessage.status;
      this.showSpinner = !(this.transactionStatus === 'COMPLETED' || this.transactionStatus === 'AWAITING_MANUAL_PROCESSING'
        || this.transactionStatus === 'CANCELLED');

      if (this.transactionStatus === 'CANCELLED') {
        this.transactionCancelled.emit();
      }

    });
  }

  private async renderPayPalButton(paypal: PayPalNamespace) {
    try {
      if (paypal.Buttons) {
        await paypal.Buttons({
          fundingSource: this.paymentSource,
          createOrder: async (data, actions) => {
            try {
              console.log('Creando orden en PayPal...');
              const order = await firstValueFrom(this.payPalService.createOrder(this.amount));
              console.log('Orden creada:', order);
              if (!order.id) {
                throw new Error('No se encontró el ID de la orden en la respuesta de creación.');
              }
              return order.id;
            } catch (error) {
              console.error('Error al crear la orden en PayPal:', error);
              throw error;
            }
          },
          onApprove: async (data, actions) => {
            try {
              console.log('onApprove: intentando capturar la orden en PayPal...');
              const captureResponse = await firstValueFrom(this.payPalService.captureOrder(data.orderID));
              console.log('Full capture response:', captureResponse);
              console.log('HTTP Status:', captureResponse.status);

              if (captureResponse.status !== 200) {
                console.error('La respuesta HTTP no es 200, es:', captureResponse.status);
                alert('Ocurrió un error durante el proceso de pago (HTTP status no 200).');
                return;
              }

              const captureResult = captureResponse.body;
              console.log('Capture result (body):', captureResult);

              const transactionId = captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.id || 'UNKNOWN';
              console.log('Transaction ID from PayPal:', transactionId);

              let orderRequest: OrderRequest | undefined;
              try {
                orderRequest = this.orderDetails;
                console.log('OrderRequest obtenido:', orderRequest);
              } catch (onSubmitError) {
                console.error('Error en onSubmitOrder:', onSubmitError);
                alert('Ocurrió un error al preparar la orden local.');
                return;
              }

              console.log('Intentando registrar la orden en el backend...');
              this.orderService.placeOrderAndTransactionForPaypalAndCreditCard(orderRequest)
                .subscribe({
                  next: (response: any) => {
                    console.log('Orden registrada exitosamente:', response);

                    if (!response || !response.transactionNumber) {
                      console.error('La respuesta no contiene transactionNumber:', response);
                      if (this.transactionStatus === 'CANCELLED') {
                        this.transactionCancelled.emit();
                        alert('Hubo un error al procesar la orden en el servidor (dato faltante).');
                      }

                      return;
                    }

                    const transactionNumber = response.transactionNumber;
                    console.log('Emitiendo paymentSuccess con transactionNumber:', transactionNumber);
                    this.paymentSuccess.emit(transactionNumber);
                  },
                  error: (err) => {
                    if (this.transactionStatus === 'CANCELLED') {
                      this.paymentFailureKeysNotAvailable.emit(this.transactionStatus)
                      this.transactionCancelled.emit();
                    }
                    console.error('Error al registrar la orden en el servidor:', err);
                  }
                });

            } catch (error) {
              console.error('Error en onApprove/captura de orden PayPal:', error);
              alert('Ocurrió un error durante el proceso de pago (captura).');
            }
          },
          onError: (err) => {
            console.error('PayPal Checkout onError:', err);
            alert('Ocurrió un error con PayPal Checkout.');
          },
        }).render('#paypal-button-container');
      }
    } catch (error) {
      console.error('Error al renderizar el botón de PayPal:', error);
    }
  }



  ngOnDestroy(): void {

    if (this.transactionStatusSubscription){
      this.transactionStatusSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }
}
