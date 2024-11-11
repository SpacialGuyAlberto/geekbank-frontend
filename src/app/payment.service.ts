// src/app/payment/services/payment.service.ts
import { Injectable } from '@angular/core';
import {PaymentMethod} from "./models/payment-method.interface";
import {OrderDetails} from "./models/order-details.model";
import { Subject, Observable } from 'rxjs';
import {TigoService} from "./tigo.service";

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private paymentMethods: { [key: string]: PaymentMethod } = {};
  private paymentStatusSubject = new Subject<PaymentStatus>();
  paymentStatus$ = this.paymentStatusSubject.asObservable();

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
      // Emitir estado inicial o intermedio si es necesario
      this.paymentStatusSubject.next({ status: 'initialized', method: methodName });
    } else {
      throw new Error(`Método de pago ${methodName} no registrado`);
    }
  }

  updatePaymentStatus(status: PaymentStatus) {
    this.paymentStatusSubject.next(status);
  }
}

export interface PaymentStatus {
  status: string;
  method: string;
  message?: string;
}
