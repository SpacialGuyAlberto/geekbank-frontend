import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { loadScript, PayPalNamespace } from '@paypal/paypal-js';
import { PayPalService } from '../pay-pal.service';
import { OrderService } from '../order.service';
import { OrderRequest } from '../models/order-request.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-paypal-button',
  template: `
    <div id="paypal-button-container"></div>
  `,
  standalone: true,
})
export class PayPalButtonComponent implements OnInit {
  @Input() amount: string | null = '';
  @Input() orderDetails?: OrderRequest;
  @Output() paymentSuccess = new EventEmitter<string>();
  @Input() paymentSource: 'paypal' | 'venmo' | 'applepay' | 'itau' | 'credit' | 'paylater' | 'card' | 'ideal' | 'sepa' | 'bancontact' | 'giropay' = 'paypal';
  @Input() onSubmitOrder!: () => Promise<any>;

  constructor(
    private payPalService: PayPalService,
    private orderService: OrderService
  ) {}

  async ngOnInit() {
    const paypal: PayPalNamespace | null = await loadScript({
      clientId: 'AWN0lCMoVrecKkOjVsrTCX6zG6Yjs2fE8RYupZMqND-pjJeEEbU0sNXS8l43DHSH2Q8omYqSnZ4RL9qC',
    });

    if (!paypal) {
      console.error('PayPal SDK no se pudo cargar.');
      return;
    }

    await this.renderPayPalButton(paypal);
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

              // Validar que el status HTTP sea 200
              if (captureResponse.status !== 200) {
                console.error('La respuesta HTTP no es 200, es:', captureResponse.status);
                alert('Ocurrió un error durante el proceso de pago (HTTP status no 200).');
                return;
              }

              // Si llegamos hasta aquí, la captura fue exitosa
              const captureResult = captureResponse.body;
              console.log('Capture result (body):', captureResult);

              // Vamos a detener aquí. No llamamos onSubmitOrder ni orderService.
              // Sólo para verificar si el error surge antes de esto.
              // Si el error persiste, es un problema en el captureOrder o en el propio PayPal Buttons.
              // Si no hay error, añade la lógica de onSubmitOrder y el servicio paso a paso.
              let orderRequest: OrderRequest;
              try {
                orderRequest = await this.onSubmitOrder();
                console.log('OrderRequest obtenido:', orderRequest);
              } catch (onSubmitError) {
                console.error('Error en onSubmitOrder:', onSubmitError);
                alert('Ocurrió un error al preparar la orden local.');
                return;
              }

              alert('Captura de la orden exitosa. Sin errores hasta este punto.');
              this.orderService.placeOrderAndTransactionForPaypalAndCreditCard(orderRequest)
                .subscribe({
                  next: (response: any) => {
                    console.log('Orden registrada exitosamente:', response);

                    if (!response || !response.transactionNumber) {
                      console.error('La respuesta no contiene transactionNumber:', response);
                      alert('Hubo un error al procesar la orden en el servidor (dato faltante).');
                      return;
                    }

                    const transactionNumber = response.transactionNumber;
                    console.log('Emitiendo paymentSuccess con transactionNumber:', transactionNumber);
                    this.paymentSuccess.emit(transactionNumber);
                  },
                  error: (err) => {
                    console.error('Error al registrar la orden en el servidor:', err);
                    alert('Hubo un error al procesar la orden en el servidor.');
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
}
