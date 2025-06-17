import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class StripeService {
  private stripePromise: Promise<Stripe | null>;
  private apiUrl = environment.apiUrl;
  private baseUrl = `${this.apiUrl}/payments`;

  constructor(private http: HttpClient) {
    this.stripePromise = loadStripe('pk_live_51RFhDhFjikDIxOfHEgc4MAHnitgb6AebPsYsNvdyJwid4ekGA7pxW0NVd3mQAS1gIN5YY3jZHGOEFkYPWd8D4yoU00IikKIuqo');
  }

  createPaymentIntent(amountCents: number): Observable<{ clientSecret: string }> {
    return this.http.post<{ clientSecret: string }>(
      `${this.baseUrl}/create-payment-intent`,
      { amount: amountCents }
    );
  }
}
