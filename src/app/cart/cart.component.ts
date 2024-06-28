// src/app/cart/cart.component.ts
import { Component, OnInit } from '@angular/core';
import { CartService } from '../cart.service';
import {NgForOf, NgIf} from "@angular/common";
import { KinguinGiftCard } from "../models/KinguinGiftCard";

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems: KinguinGiftCard[] = [];
  quantityInCart: number = 0;
  showDialog: boolean = false;
  private isInCart: boolean | undefined;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCartItems();
  }

  loadCartItems(): void {
    this.cartService.getCartItems().subscribe(data => {
      this.cartItems = data;
      console.log("Loaded cart items: ", data);
    });
  }

  removeCartItem(cartItemId: number): void {
    console.log('Removing item with ID: ' + cartItemId);
    this.cartService.removeCartItem(cartItemId).subscribe(() => {
      this.loadCartItems(); // Recargar los elementos después de la eliminación
    });
  }

  removeAllCartItems(): void {
    this.cartService.removeAllCartItems().subscribe(() => {
      this.loadCartItems(); // Reload cart items after deletion
    });
  }

  incrementProductQuantity(item: KinguinGiftCard): void {
    item.quantity++;
    this.cartService.updateCartItem(Number(item.productId), item.quantity).subscribe(() => {
      console.log('Increased quantity:', item);
    });
  }


  decreaseProductQuantity(giftCard: KinguinGiftCard): void {
    if (giftCard.quantity > 0) {
      giftCard.quantity--;
      this.cartService.updateCartItem(Number(giftCard.productId), giftCard.quantity).subscribe(() => {
        console.log('Decreased quantity:', giftCard);
      });
    }
    if (giftCard.quantity === 0) {
      this.showDialog = true;
      setTimeout(() => {
        this.closeDialog();
      }, 3000);  // Dialog will close after 3 seconds
    }
  }

  closeDialog(): void {
    this.showDialog = false;
  }

  protected readonly Number = Number;
}
