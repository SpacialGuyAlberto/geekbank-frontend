import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { loadScript, PayPalNamespace } from '@paypal/paypal-js';
import { Subscription, firstValueFrom } from 'rxjs';
import { PayPalService } from '../payment-options/pay-pal.service';
import { TransactionsService } from "../transactions/transactions.service";
import { OrderService } from '../services/order.service';
import { OrderRequest } from '../models/order-request.model';
import { WebSocketService } from "../services/web-socket.service";

/**
 * Componente que dibuja el botón de PayPal y maneja la lógica
 * de crear/capturar la orden con el backend.
 */
@Component({
  selector: 'app-paypal-button',
  template: `
    <div id="paypal-button-container"></div>
  `,
  standalone: true,
})
export class PayPalButtonComponent implements OnInit, OnDestroy {
  @Input() amount: string | null = null;  // Monto a cobrar en USD, por ejemplo "10.00"
  @Input() orderDetails?: OrderRequest;   // Detalles internos de tu orden
  @Input() paymentSource:
    | 'paypal'
    | 'venmo'
    | 'applepay'
    | 'itau'
    | 'credit'
    | 'paylater'
    | 'card'
    | 'ideal'
    | 'sepa'
    | 'bancontact'
    | 'giropay'
    = 'paypal';

  @Input() onSubmitOrder!: () => Promise<OrderRequest>;

  @Output() paymentSuccess = new EventEmitter<string>();
  @Output() paymentFailureKeysNotAvailable = new EventEmitter<string>();
  @Output() transactionCancelled = new EventEmitter<void>();

  transactionStatus: string = '';
  showSpinner: boolean = false;
  private transactionStatusSubscription: Subscription | undefined;

  constructor(
    private payPalService: PayPalService,
    private orderService: OrderService,
    private transactionService: TransactionsService,
    private webSocketService: WebSocketService
  ) {
    // Ejemplo de uso de WebSocket para status, si lo tienes implementado.
    this.webSocketService.connect();
  }

  async ngOnInit() {
    // Carga dinámica del script de PayPal con tu Client ID
    const paypal: PayPalNamespace | null = await loadScript({
      clientId: 'AdSFKstNcV1wB1UZLGjxgdWoPAoRRxab0GueeSo34FBSmSjbchZErM7WPxBrE5u6CxRUNwtnOaq4eS1W',
      currency: 'USD',
    });

    if (!paypal) {
      console.error('PayPal SDK no se pudo cargar.');
      return;
    }

    // Renderizar el botón
    await this.renderPayPalButton(paypal);

    // Suscripción a un websocket de ejemplo (si tu proyecto lo usa)
    this.transactionStatusSubscription = this.webSocketService.subscribeToTransactionStatus().subscribe(parsedMessage => {
      this.transactionStatus = parsedMessage.status;
      // Manejar spinner, etc.
      this.showSpinner = !(this.transactionStatus === 'COMPLETED'
        || this.transactionStatus === 'AWAITING_MANUAL_PROCESSING'
        || this.transactionStatus === 'CANCELLED');

      if (this.transactionStatus === 'CANCELLED') {
        this.transactionCancelled.emit();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.transactionStatusSubscription) {
      this.transactionStatusSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }

  /**
   * Configura y renderiza los PayPal Buttons en el <div id="paypal-button-container"></div>
   */
  private async renderPayPalButton(paypal: PayPalNamespace) {
    try {
      if (!paypal.Buttons) {
        console.error('paypal.Buttons no está disponible.');
        return;
      }

      await paypal.Buttons({
        fundingSource: this.paymentSource,

        // 1. createOrder: Se ejecuta cuando el usuario hace clic en "Pagar"
        createOrder: async (data, actions) => {
          try {
            console.log('Creando orden en PayPal...');
            // Llamamos a nuestro backend (PayPalService -> /api/paypal/create-order)
            const order = await firstValueFrom(this.payPalService.createOrder(this.amount));
            console.log('Orden creada (backend) => ID:', order.id);

            if (!order.id) {
              throw new Error('No se encontró el ID de la orden en la respuesta de creación.');
            }
            // Retornamos order.id a PayPal Buttons
            return order.id;
          } catch (error) {
            console.error('Error al crear la orden en PayPal:', error);
            throw error;
          }
        },

        // 2. onApprove: Se llama cuando PayPal ha aprobado la orden (el usuario se logueó, etc.)
        onApprove: async (data, actions) => {
          try {
            console.log('onApprove: intentando capturar la orden en PayPal...');
            // Llamamos al backend para capturar
            // con `observe: 'response'`, la respuesta incluye status y body
            const captureResponse = await firstValueFrom(this.payPalService.captureOrder(data.orderID));

            console.log('Full capture response:', captureResponse);
            console.log('HTTP Status:', captureResponse.status);

            if (captureResponse.status !== 200) {
              // Si no es 200, algo falló (422, 400, 500, etc.)
              console.error('La respuesta HTTP no es 200, es:', captureResponse.status);
              alert('Ocurrió un error durante el proceso de pago (HTTP status no 200).');
              return;
            }

            // Si es 200, extraemos el body
            const captureResult = captureResponse.body;
            console.log('Capture result (body):', captureResult);

            // Ejemplo de obtener ID de la transacción
            const transactionId =
              captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.id || 'UNKNOWN';

            console.log('Transaction ID from PayPal:', transactionId);

            // ~~~ Lógica adicional: Registrar la orden en tu backend ~~~
            let orderRequest: OrderRequest | undefined;
            try {
              // Si tienes un callback para "onSubmitOrder", o usas this.orderDetails
              orderRequest = this.orderDetails;
              console.log('OrderRequest obtenido:', orderRequest);
            } catch (onSubmitError) {
              console.error('Error en onSubmitOrder:', onSubmitError);
              alert('Ocurrió un error al preparar la orden local.');
              return;
            }

            // Llamada a tu "OrderService" si deseas registrar la orden/transaction
            // en tu base de datos con la transacción completada:
            // if (orderRequest) {
            //   this.orderService.placeOrderAndTransactionForPaypalAndCreditCard(orderRequest)
            //     .subscribe({
            //       next: (response: any) => {
            //         console.log('Orden registrada exitosamente en tu backend:', response);
            //
            //         if (!response || !response.transactionNumber) {
            //           console.error('La respuesta no contiene transactionNumber:', response);
            //
            //           if (this.transactionStatus === 'CANCELLED') {
            //             this.transactionCancelled.emit();
            //             alert('Hubo un error al procesar la orden (dato faltante).');
            //           }
            //           return;
            //         }
            //
            //         const transactionNumber = response.transactionNumber;
            //         console.log('Emitiendo paymentSuccess con transactionNumber:', transactionNumber);
            //         // Emite un evento para avisar al padre que todo fue OK
            //         this.paymentSuccess.emit(transactionNumber);
            //       },
            //       error: (err) => {
            //         if (this.transactionStatus === 'CANCELLED') {
            //           this.paymentFailureKeysNotAvailable.emit(this.transactionStatus);
            //           this.transactionCancelled.emit();
            //         }
            //         console.error('Error al registrar la orden en el servidor:', err);
            //       }
            //     });
            // }

          } catch (error) {
            console.error('Error en onApprove/captura de orden PayPal:', error);
            alert('Ocurrió un error durante el proceso de pago (captura).');
          }
        },

        // 3. onError: Maneja errores globales del Checkout de PayPal
        onError: (err) => {
          console.error('PayPal Checkout onError:', err);
          alert('Ocurrió un error con PayPal Checkout.');
        }
      }).render('#paypal-button-container');
    } catch (error) {
      console.error('Error al renderizar el botón de PayPal:', error);
    }
  }
}
