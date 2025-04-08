import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";


@Injectable({
  providedIn: 'root', // Add this line
})
export class PayPalService {
  private apiUrl = `${environment.apiUrl}/paypal`;
  constructor(private http: HttpClient) {}

  createOrder(amount: string | null): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${this.apiUrl}/create-order`, { amount });
  }
  captureOrder(orderId: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(
      `${this.apiUrl}/capture-order/${orderId}`,
      {},
      { observe: 'response' }
    );
  }
}
