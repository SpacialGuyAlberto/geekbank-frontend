import { Component, OnInit } from '@angular/core';
import { CartService } from '../cart.service';
import { NgForOf, NgIf } from "@angular/common";
import { KinguinGiftCard } from "../models/KinguinGiftCard";
import { RouterLink } from "@angular/router";
import { TigoPaymentComponent } from "../tigo-payment/tigo-payment.component";
import {CartItemWithGiftcard} from "../models/CartItem";

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    RouterLink,
    TigoPaymentComponent
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems: CartItemWithGiftcard[] = [];
  showDialog: boolean = false;
  protected showPaymentModal: boolean = false;
  cartItemCount: number = 0;
  totalPrice: number = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCartItems();
  }

  loadCartItems(): void {
    this.cartService.getCartItems().subscribe(data => {
      this.cartItems = data;
      this.updateCartItemCount();
      console.log("Loaded cart items: ", data);
    });
  }

  removeCartItem(cartItemId: number): void {
    console.log('Removing item with ID: ' + cartItemId);
    this.cartService.removeCartItem(cartItemId).subscribe(() => {
      this.loadCartItems(); // Recargar los elementos después de la eliminación
    });
  }

  getTotalItemCount(): number {
    return this.cartItems.reduce((count, item) => count + item.cartItem.quantity, 0);
  }


  removeAllCartItems(): void {
    this.cartService.removeAllCartItems().subscribe(() => {
      this.loadCartItems(); // Recargar los elementos después de la eliminación
    });
  }

  incrementProductQuantity(item: CartItemWithGiftcard): void {
    item.cartItem.quantity++;
    this.cartService.updateCartItem(Number(item.cartItem.productId), item.cartItem.quantity).subscribe(() => {
      console.log('Increased quantity:', item);
      this.updateCartItemCount();
    });
  }

  decreaseProductQuantity(item: CartItemWithGiftcard): void {
    if (item.cartItem.quantity > 0) {
      item.cartItem.quantity--;
      this.cartService.updateCartItem(Number(item.cartItem.productId), item.cartItem.quantity).subscribe(() => {
        console.log('Decreased quantity:', item);
        this.updateCartItemCount();
      });
    }
    if (item.cartItem.quantity === 0) {
      this.showDialog = true;
      setTimeout(() => {
        this.closeDialog();
      }, 3000);
    }
  }

  openPaymentModal(): void {
    this.showPaymentModal = true;
  }

  closeDialog(): void {
    this.showDialog = false;
  }

  getTotalPrice(): number {
    let total =  this.cartItems.reduce((total, item) => total + item.cartItem.quantity * item.giftcard.price, 0);
    this.totalPrice = parseFloat(total.toFixed(2));
    return parseFloat(total.toFixed(2));
  }

  updateCartItemCount(): void {
    const totalCount = this.cartItems.reduce((total, item) => total + item.cartItem.quantity, 0);
    this.cartService.updateCartItemCount(totalCount);
    console.log(totalCount);
  }

  protected readonly Number = Number;
}
