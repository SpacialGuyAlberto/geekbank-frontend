import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { NgIf } from "@angular/common";
import { CartItemWithGiftcard } from "../models/CartItem";
import {TigoService} from "../tigo.service";// Importa el servicio

@Component({
  selector: 'app-tigo-payment',
  standalone: true,
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './tigo-payment.component.html',
  styleUrls: ['./tigo-payment.component.css']
})
export class TigoPaymentComponent {
  @Input() cartItems: CartItemWithGiftcard[] = [];
  @Input() totalPrice: number = 0;
  @Output() close = new EventEmitter<void>();

  showModal: boolean = true;
  showConfirmation: boolean = true;

  paymentDetails = {
    name: '',
    address: '',
    phoneNumber: '',
    total: 0
  };

  constructor(private tigoService: TigoService) {} // Inyecta el servicio

  ngOnInit(): void {
    this.paymentDetails.total = this.totalPrice;
  }

  closeModal(): void {
    this.showModal = false;
    this.close.emit();
  }

  onSubmit(): void {
    const orderDetails = {
      phoneNumber: this.paymentDetails.phoneNumber,
      products: this.cartItems.map(item => ({
        kinguinId: item.giftcard.kinguinId,
        qty: item.cartItem.quantity,
        price: item.giftcard.price
      }))
    };

    this.tigoService.placeOrder(orderDetails).subscribe(
      response => {
        console.log('Order placed successfully', response);
        this.showConfirmation = true;
      },
      error => {
        console.error('Error placing order', error);
      }
    );
  }
}
