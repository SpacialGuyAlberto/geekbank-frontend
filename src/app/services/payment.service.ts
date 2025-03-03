import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CreatePaymentResponse, CapturePaymentResponse } from '../payment-options/payment.models';
import { environment } from '../../environments/environment';
import {PaymentMethod} from "../payment-options/payment-method.interface";
import { OrderDetails } from '../models/order-details.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private paymentMethods: { [key: string]: PaymentMethod } = {};

  constructor(private http: HttpClient) { }

  registerPaymentMethod(name: string, method: PaymentMethod) {
    this.paymentMethods[name] = method;
  }
  getPaymentMethod(name: string): PaymentMethod | undefined {
    return this.paymentMethods[name];
  }

  initializePayment(methodName: string, orderDetails: OrderDetails) {
    const method = this.getPaymentMethod(methodName);
    if (method) {
      method.initializePayment(orderDetails);
    } else {
      throw new Error(`Método de pago ${methodName} no registrado`);
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
