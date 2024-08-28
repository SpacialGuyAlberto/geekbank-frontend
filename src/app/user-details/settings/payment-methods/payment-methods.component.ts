import { Component, OnInit } from '@angular/core';
import {FormsModule} from "@angular/forms";

interface PaymentMethod {
  type: string;
  cardNumber: string;
  lastFourDigits: string;
  expiryDate: string;
}

@Component({
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.component.html',
  standalone: true,
  imports: [
    FormsModule
  ],
  styleUrls: ['./payment-methods.component.css']
})
export class PaymentMethodsComponent implements OnInit {
  paymentMethods: PaymentMethod[] = [];
  newPaymentMethod: PaymentMethod = { type: '', cardNumber: '', lastFourDigits: '', expiryDate: '' };

  constructor() { }

  ngOnInit(): void {
    this.loadPaymentMethods();
  }

  loadPaymentMethods(): void {
    // Simulación de métodos de pago actuales
    this.paymentMethods = [
      { type: 'Visa', cardNumber: '**** **** **** 1234', lastFourDigits: '1234', expiryDate: '12/24' },
      { type: 'MasterCard', cardNumber: '**** **** **** 5678', lastFourDigits: '5678', expiryDate: '11/23' }
    ];
  }

  addPaymentMethod(): void {
    // Lógica para añadir un nuevo método de pago
    console.log('Añadir método de pago', this.newPaymentMethod);
    this.paymentMethods.push(this.newPaymentMethod);
    this.newPaymentMethod = { type: '', cardNumber: '', lastFourDigits: '', expiryDate: '' };
  }

  editPaymentMethod(paymentMethod: PaymentMethod): void {
    // Lógica para editar un método de pago
    console.log('Editar método de pago', paymentMethod);
  }

  removePaymentMethod(paymentMethod: PaymentMethod): void {
    // Lógica para eliminar un método de pago
    this.paymentMethods = this.paymentMethods.filter(p => p !== paymentMethod);
    console.log('Método de pago eliminado', paymentMethod);
  }
}
