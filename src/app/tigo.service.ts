import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../environments/environment";
import {TransactionResponse} from "./models/transaction-response.model";
import {PaymentMethod} from "./models/payment-method.interface";
import {OrderDetails} from "./models/order-details.model";


@Injectable({
  providedIn: 'root'
})
export class TigoService{

  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  placeOrder(orderDetails: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(this.apiUrl, orderDetails, { headers, responseType: 'text' });
  }

}
