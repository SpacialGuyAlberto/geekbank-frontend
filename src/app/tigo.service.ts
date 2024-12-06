import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {environment} from "../environments/environment";
import {TransactionResponse} from "./models/transaction-response.model";
import {PaymentMethod} from "./models/payment-method.interface";
import {OrderDetails} from "./models/order-details.model";
import {OrderRequest} from "./models/order-request.model";
import {Transaction} from "./models/transaction.model";


@Injectable({
  providedIn: 'root'
})
export class TigoService{

  private apiUrl = `${environment.apiUrl}/orders`;
  private apiUrlOrder = `${environment.apiUrl}/orders/create-order-for-verified-tigo-payment`;
  private transactionSubject = new BehaviorSubject<Transaction | null>(null);

  constructor(private http: HttpClient) {}

  placeOrder(orderDetails: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(this.apiUrl, orderDetails, { headers, responseType: 'text' });
  }

  getTransaction(): Observable<Transaction | null> {
    return this.transactionSubject.asObservable();
  }

  emitTransaction(transaction: Transaction): void {
    this.transactionSubject.next(transaction);
  }

  placeOrderForVerifiedPayment(orderDetails: any): Observable<Transaction> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<Transaction>(this.apiUrlOrder, orderDetails, { headers });
  }
  purchaseWithBalance(orderRequest: OrderRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/purchase-with-balance`, orderRequest);
  }

}
