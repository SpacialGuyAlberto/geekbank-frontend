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
    // Cargar PayPal SDK
    const paypal: PayPalNamespace | null = await loadScript({
      clientId: 'AWN0lCMoVrecKkOjVsrTCX6zG6Yjs2fE8RYupZMqND-pjJeEEbU0sNXS8l43DHSH2Q8omYqSnZ4RL9qC',
    });

    if (!paypal) {
      console.error('PayPal SDK no se pudo cargar.');
      return;
    }

    // Renderizar el botón de PayPal con el método deseado
    await this.renderPayPalButton(paypal);
  }

  private async renderPayPalButton(paypal: PayPalNamespace) {
    try {
      if (paypal.Buttons) {
        await paypal.Buttons({
          fundingSource: this.paymentSource,
          createOrder: async (data, actions) => {
            try {
              const order = await firstValueFrom(this.payPalService.createOrder(this.amount));
              if (!order.id) {
                throw new Error('No se encontró el ID de la orden en la respuesta.');
              }
              return order.id;
            } catch (error) {
              console.error('Error al crear la orden en PayPal:', error);
              throw error;
            }
          },
          onApprove: async (data, actions) => {
            try {
              // Capturar la orden en PayPal
              const captureResult = await firstValueFrom(this.payPalService.captureOrder(data.orderID));
              console.log('Capture result:', captureResult);

              // Verificar que la orden esté completada
              if (captureResult?.status !== 'COMPLETED') {
                console.error('La orden no está COMPLETED. Respuesta:', captureResult);
                alert('Ocurrió un error durante el proceso de pago.');
                return;
              }

              // Obtener el número de transacción de la respuesta de PayPal
              const transactionId = captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.id || 'UNKNOWN';
              console.log('Transaction ID from PayPal:', transactionId);

              // Ahora que tenemos la orden capturada en PayPal, llamamos a la función para generar la orderRequest
              if (this.onSubmitOrder) {
                const orderRequest = await this.onSubmitOrder();
                console.log('OrderRequest obtenido:', orderRequest);

                // Llamar al servicio para registrar la orden y la transacción
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
                      this.paymentSuccess.emit(transactionNumber);
                    },
                    error: (err) => {
                      console.error('Error al registrar la orden:', err);
                      alert('Hubo un error al procesar la orden en el servidor.');
                    }
                  });
              } else {
                console.warn('La función onSubmitOrder no está definida.');
              }

            } catch (error) {
              console.error('Error al capturar la orden en PayPal:', error);
              alert('Ocurrió un error durante el proceso de pago.');
            }
          },
          onError: (err) => {
            console.error('PayPal Checkout onError:', err);
            alert('Ocurrió un error con PayPal Checkout.');
          },
        }).render('#paypal-button-container');
      }
    } catch (error) {
      console.error('Error al renderizar el botón de PayPal', error);
    }
  }
}
