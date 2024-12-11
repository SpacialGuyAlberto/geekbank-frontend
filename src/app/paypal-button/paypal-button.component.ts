import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { loadScript, PayPalNamespace } from '@paypal/paypal-js';
import { PayPalService } from '../pay-pal.service';
import { OrderService } from '../order.service';
import { OrderRequest } from '../models/order-request.model';

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
          fundingSource: this.paymentSource, // Renderizar solo el método seleccionado
          createOrder: async (data, actions) => {
            try {
              const order = await this.payPalService.createOrder(this.amount).toPromise();
              if (!order.id) {
                throw new Error('Order ID not found in the response');
              }
              return order.id;
            } catch (error) {
              console.error('Error creating order:', error);
              throw error;
            }
          },
          onApprove: async (data, actions) => {
            try {
              const captureResult = await this.payPalService.captureOrder(data.orderID).toPromise();
              this.paymentSuccess.emit('Payment Successful');
            } catch (error) {
              console.error('Error capturing order:', error);
              alert('An error occurred during payment processing.');
            }
          },
          onError: (err) => {
            console.error('PayPal Checkout onError:', err);
            alert('An error occurred with PayPal Checkout.');
          },
        }).render('#paypal-button-container');
      }
    } catch (error) {
      console.error('Error al renderizar el botón de PayPal', error);
    }
  }
}
