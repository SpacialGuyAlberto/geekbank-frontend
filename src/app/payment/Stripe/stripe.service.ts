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
    this.stripePromise = loadStripe('pk_test_51RFhDrFw1cEgaazIof8waOHo2T4xXIXMTWbFeblcwBOad2U0OzDo4JNFM7BkD4DaYbkg6OQpfrGNRDt1WI0JSfzD00qUHX0WP6');
  }

  createPaymentIntent(amountCents: number): Observable<{ clientSecret: string }> {
    return this.http.post<{ clientSecret: string }>(
      `${this.baseUrl}/create-payment-intent`,
      { amount: amountCents }
    );
  }
}
