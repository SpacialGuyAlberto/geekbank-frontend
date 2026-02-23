import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import {
  loadStripe,
  Stripe, StripeCardCvcElement,
  StripeCardElement,
  StripeCardExpiryElement,
  StripeCardNumberElement,
  StripeElements
} from "@stripe/stripe-js";
import { StripeService } from "../stripe.service";
import { firstValueFrom } from "rxjs";
import { CurrencyPipe, NgIf } from "@angular/common";
import { OrderRequest } from "../../../models/order-request.model";
import { OrderService } from "../../../services/order.service";
import { environment } from "../../../../environments/environment";

@Component({
  selector: 'app-card-payment',
  imports: [
    NgIf,
    CurrencyPipe
  ],
  templateUrl: './card-payment.component.html',
  styleUrl: './card-payment.component.css'
})
export class CardPaymentComponent implements OnInit, AfterViewInit {
  @Input() totalOrderAmountHNL!: number;
  @Input() amount!: number;
  @Input() orderDetails?: OrderRequest;
  @Output() paymentSuccess = new EventEmitter<string>(); // transactionNumber o id
  @Output() paymentFailureKeysNotAvailable = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  @ViewChild('cardNumber') cardNumberRef!: ElementRef;
  @ViewChild('cardExpiry') cardExpiryRef!: ElementRef;
  @ViewChild('cardCvc') cardCvcRef!: ElementRef;

  stripe!: Stripe;
  cardNumber!: StripeCardNumberElement;
  cardExpiry!: StripeCardExpiryElement;
  cardCvc!: StripeCardCvcElement;
  elements!: StripeElements;
  card!: StripeCardElement;
  loading = false;
  error?: string;
  private stripeToken = environment.stripeToken;

  constructor(
    private stripeSvc: StripeService,
    private orderService: OrderService,
  ) { }

  onClose() {
    this.close.emit();
  }

  async ngOnInit() {
    // Optional: Log product IDs for debugging
  }

  async ngAfterViewInit() {
    this.stripe = (await loadStripe(this.stripeToken)) as Stripe;
    this.elements = this.stripe.elements();

    this.cardNumber = this.elements.create('cardNumber');
    this.cardExpiry = this.elements.create('cardExpiry');
    this.cardCvc = this.elements.create('cardCvc');

    this.cardNumber.mount(this.cardNumberRef.nativeElement);
    this.cardExpiry.mount(this.cardExpiryRef.nativeElement);
    this.cardCvc.mount(this.cardCvcRef.nativeElement);
  }

  async payCard(): Promise<void> {
    this.loading = true;
    this.error = undefined;

    try {
      const { clientSecret } = await firstValueFrom(
        this.stripeSvc.createPaymentIntent(65)
      );

      const { error, paymentIntent } =
        await this.stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: this.cardNumber }
        });

      if (error) {
        throw new Error(error.message ?? 'Error desconocido');
      }
      if (paymentIntent?.status !== 'succeeded') {
        throw new Error('El pago no se completó');
      }

      const orderToSend: OrderRequest = {
        ...this.orderDetails!,
        transactionNumber: paymentIntent.id
      };

      this.orderService
        .placeOrderAndTransactionForPaypalAndCreditCard(orderToSend)
        .subscribe({
          next: (response: any) => {
            const txNumber = response?.transactionNumber ?? paymentIntent.id;
            this.paymentSuccess.emit(txNumber);
          },
          error: err => {
            console.error('[CardPay] Error backend:', err);
            this.paymentFailureKeysNotAvailable.emit();
          }
        });

    } catch (err: any) {
      this.error = err?.message || 'Fallo en el pago';
      this.paymentFailureKeysNotAvailable.emit();
    } finally {
      this.loading = false;
    }
  }
}
