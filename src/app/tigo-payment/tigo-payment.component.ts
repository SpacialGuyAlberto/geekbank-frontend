import { Component, Input, Output, EventEmitter } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {KinguinGiftCard} from "../models/KinguinGiftCard";
import {TigoPaymentProtocollService} from "../tigo-payment-protocoll.service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-tigo-payment',
  standalone: true,
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './tigo-payment.component.html',
  styleUrl: './tigo-payment.component.css'
})
export class TigoPaymentComponent {
  // @Input() cartItems: any[];
  @Output() close = new EventEmitter<void>();
  @Input() cartItems!: KinguinGiftCard[];
  showModal: boolean = true;
  showConfirmation: boolean = false;

  paymentDetails = {
    name: '',
    address: '',
    total: 0
  };

  constructor(private paymentService: TigoPaymentProtocollService) {}

  ngOnInit(): void {
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.paymentDetails.total = this.cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }

  closeModal(): void {
    this.showModal = false;
    this.close.emit();
  }

  onSubmit(): void {
    this.showConfirmation = true;
  }

}
