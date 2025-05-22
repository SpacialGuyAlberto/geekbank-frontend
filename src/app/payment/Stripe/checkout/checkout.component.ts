import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import {StripeService} from "../stripe.service";
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import {CurrencyPipe, NgIf} from "@angular/common";
import {firstValueFrom} from "rxjs";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  standalone: true,
  imports: [
    CurrencyPipe,
    NgIf
  ],
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements AfterViewInit {
  amount = 5000; // céntimos
  stripe!: Stripe;
  elements!: StripeElements;
  card!: StripeCardElement;
  loading = false;
  error?: string;

  @ViewChild('cardElem') cardElem!: ElementRef;

  constructor(private stripeSvc: StripeService) {}

  async ngAfterViewInit() {
    this.stripe = (await loadStripe('pk_test_51RFhDrFw1cEgaazIof8waOHo2T4xXIXMTWbFeblcwBOad2U0OzDo4JNFM7BkD4DaYbkg6OQpfrGNRDt1WI0JSfzD00qUHX0WP6')) as Stripe;
    this.elements = this.stripe.elements();
    this.card = this.elements.create('card');
    this.card.mount(this.cardElem.nativeElement);
  }

  async pay() {
    this.loading = true;
    this.error = undefined;

    try {
      // 1. Obtener clientSecret desde Observable
      const { clientSecret } = await firstValueFrom(
        this.stripeSvc.createPaymentIntent(this.amount)
      );

      // 2. Confirmar el pago
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: this.card }
      });

      if (error) {
        this.error = error.message ?? 'Error desconocido';
      } else if (paymentIntent) {

        // Aquí puedes navegar al componente de resultado y pasar datos
      }
    } catch (e: any) {
      this.error = e?.message || 'Fallo en el pago';
    } finally {
      this.loading = false;
    }
  }
}
