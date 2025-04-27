import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PayPalService {

  private apiUrl = `${environment.apiUrl}/paypal`;

  constructor(private http: HttpClient) {}

  /* ------------ Paso 1 – Create Order ----------------- */
  /* createOrder ahora recibe paymentSource para que el backend sepa si es card */
  createOrder(amount: string | null) {
    return this.http.post<{ id: string }>(
      `${this.apiUrl}/create-order`,
      { amount }
    );
  }

  /* 2 ─ capture */
  captureOrder(orderId: string) {
    return this.http.post<any>(
      `${this.apiUrl}/capture-order/${orderId}`,
      {},
      { observe: 'response' }
    );
  }
}
