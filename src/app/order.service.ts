// order.service.ts
import { Injectable } from '@angular/core';
import {OrderRequest} from "./models/order-request.model";
import {environment} from "../environments/environment";
import {Observable, throwError} from "rxjs";
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError} from "rxjs/operators";
import {Order} from "./models/order.model";
@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = `${environment.apiUrl}/orders`;
  constructor(private http: HttpClient) {}


  placeOrderAndTransactionForPaypalAndCreditCard(orderRequest: OrderRequest) : Observable<any> {
    return this.http.post(`${this.apiUrl}/create-order-for-paypal-and-credit-card`, orderRequest)
  }

  purchaseWithBalance(orderRequest: OrderRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/purchase-with-balance`, orderRequest);
  }

  findOrder(transactionNumber: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/find-by-transaction/${transactionNumber}`)
      .pipe(
        catchError(this.handleError) // Manejar errores
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMsg = '';
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMsg = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMsg = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMsg);
  }

}
