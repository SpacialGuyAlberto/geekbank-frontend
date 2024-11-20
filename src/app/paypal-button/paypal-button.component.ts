import { Component, OnInit, Input } from '@angular/core';
import { loadScript, PayPalNamespace } from '@paypal/paypal-js';
import {PayPalService} from "../pay-pal.service";

@Component({
  selector: 'app-paypal-button',
  template: `
    <div id="paypal-button-container"></div>`,
  standalone: true
})
export class PayPalButtonComponent implements OnInit {
  @Input() amount: string | null = '';

  constructor(private payPalService: PayPalService) {}

  async ngOnInit() {
    try {
      const paypal: PayPalNamespace | null = await loadScript({ clientId: 'AWN0lCMoVrecKkOjVsrTCX6zG6Yjs2fE8RYupZMqND-pjJeEEbU0sNXS8l43DHSH2Q8omYqSnZ4RL9qC' });

      if (paypal === null) {
        console.error('PayPal SDK no se pudo cargar.');
        return;
      }

      await this.renderPayPalButton(paypal);
    } catch (error) {
      console.error('Error al cargar el PayPal SDK', error);
    }
  }

  private async renderPayPalButton(paypal: PayPalNamespace) {
    try {
      if (paypal.Buttons) {
        await paypal.Buttons({
          createOrder: async (data, actions) => {
            // paypal-button.component.ts
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
              alert('Payment completed successfully!');
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
