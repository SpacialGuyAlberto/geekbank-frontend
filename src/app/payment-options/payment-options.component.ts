import {Component, EventEmitter, Output} from '@angular/core';
import {NgIf} from "@angular/common";
import { PaymentMethod } from '../models/payment-method.interface';
import { OrderDetails } from '../models/order-details.model';

@Component({
  selector: 'app-payment-options',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './payment-options.component.html',
  styleUrl: './payment-options.component.css'
})
export class PaymentOptionsComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() paymentSelected = new EventEmitter<string>();

  close() {
    this.closeModal.emit();
  }

  selectPaymentMethod(method: string) {
    this.paymentSelected.emit(method);
    this.close();
  }
}
