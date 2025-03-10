import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from "../../environments/environment";


@Injectable({
  providedIn: 'root', // Add this line
})
export class PayPalService {
  private apiUrl = `${environment.apiUrl}/paypal`;
  constructor(private http: HttpClient) {}

  createOrder(amount: string | null) {
    return this.http.post<any>(`${this.apiUrl}/create-order`, { amount });
  }

  captureOrder(orderId: string) {
    return this.http.post<any>(`${this.apiUrl}/capture-order/${orderId}`, {},  { observe: 'response' });
  }
}
