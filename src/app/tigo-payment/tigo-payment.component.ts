import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { NgIf } from "@angular/common";
import { CartItemWithGiftcard } from "../models/CartItem";
import { TigoService } from "../tigo.service";

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
  showConfirmation: boolean = false;
  showSpinner: boolean = false;

  paymentDetails = {
    name: '',
    address: '',
    phoneNumber: '',
    total: 0
  };
  userId: string | null = '';

  constructor(private tigoService: TigoService) {}

  ngOnInit(): void {
    this.paymentDetails.total = this.totalPrice;
    this.userId = sessionStorage.getItem("userId");
    console.log(' USER ID: ' + this.userId);
  }

  closeModal(): void {
    this.showModal = false;
    this.close.emit();
  }

  onSubmit(): void {
    this.showSpinner = true; // Mostrar spinner al hacer clic en Pay
    const orderDetails = {
      userId: parseInt(<string>sessionStorage.getItem("userId")),
      phoneNumber: this.paymentDetails.phoneNumber,
      products: this.cartItems.map(item => ({
        kinguinId: item.giftcard.kinguinId,
        qty: item.cartItem.quantity,
        price: item.giftcard.price
      })),
      amount: 35.2
    };

    this.tigoService.placeOrder(orderDetails).subscribe(
      response => {
        console.log('Order placed successfully', response);
        this.showConfirmation = true;
        this.showSpinner = false; // Ocultar spinner al recibir respuesta
      },
      error => {
        console.error('Error placing order', error);
        this.showSpinner = false; // Ocultar spinner en caso de error
      }
    );
  }
}
