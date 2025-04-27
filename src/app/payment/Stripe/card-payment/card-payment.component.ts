import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {
  loadStripe,
  Stripe, StripeCardCvcElement,
  StripeCardElement,
  StripeCardExpiryElement,
  StripeCardNumberElement,
  StripeElements
} from "@stripe/stripe-js";
import {StripeService} from "../stripe.service";
import {firstValueFrom} from "rxjs";
import {CurrencyPipe, NgIf} from "@angular/common";

@Component({
  selector: 'app-card-payment',
  standalone: true,
  imports: [
    NgIf,
    CurrencyPipe
  ],
  templateUrl: './card-payment.component.html',
  styleUrl: './card-payment.component.css'
})
export class CardPaymentComponent implements AfterViewInit {
  @Input() amount!: number;               // céntimos
  @Input() orderDetails: any;            // datos de la orden
  @Output() paymentSuccess = new EventEmitter<string>(); // transactionNumber o id
  @Output() paymentFailureKeysNotAvailable = new EventEmitter<void>();

  @ViewChild('cardElem') cardElem!: ElementRef;
  @ViewChild('cardNumber') cardNumberRef!: ElementRef;
  @ViewChild('cardExpiry') cardExpiryRef!: ElementRef;
  @ViewChild('cardCvc')    cardCvcRef!: ElementRef;

  stripe!: Stripe;
  cardNumber!: StripeCardNumberElement;
  cardExpiry!: StripeCardExpiryElement;
  cardCvc!: StripeCardCvcElement;
  elements!: StripeElements;
  card!: StripeCardElement;
  loading = false;
  error?: string;

  constructor(private stripeSvc: StripeService) {}

  async ngAfterViewInit() {
    this.stripe = (await loadStripe('pk_live_51RFhDhFjikDIxOfHEgc4MAHnitgb6AebPsYsNvdyJwid4ekGA7pxW0NVd3mQAS1gIN5YY3jZHGOEFkYPWd8D4yoU00IikKIuqo')) as Stripe;
    this.elements = this.stripe.elements();
    this.cardNumber = this.elements.create('cardNumber');
    this.cardExpiry = this.elements.create('cardExpiry');
    this.cardCvc    = this.elements.create('cardCvc');

    this.cardNumber.mount(this.cardNumberRef.nativeElement);
    this.cardExpiry.mount(this.cardExpiryRef.nativeElement);
    this.cardCvc.mount(this.cardCvcRef.nativeElement);
  }

  async payCard(): Promise<void> {
    this.loading = true;
    this.error = undefined;

    try {
      if (!this.cardNumber) {
        throw new Error('Stripe card element no está inicializado');
      }

      const { clientSecret } = await firstValueFrom(
        this.stripeSvc.createPaymentIntent(this.amount)
      );

      const { error, paymentIntent } =
        await this.stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: this.cardNumber }
        });

      if (error) {
        this.error = error.message ?? 'Error desconocido';
        this.paymentFailureKeysNotAvailable.emit();
      } else if (paymentIntent?.status === 'succeeded') {
        this.paymentSuccess.emit(paymentIntent.id);
      }
    } catch (err: any) {
      this.error = err?.message || 'Fallo en el pago';
      this.paymentFailureKeysNotAvailable.emit();
    } finally {
      this.loading = false;
    }
  }

}
