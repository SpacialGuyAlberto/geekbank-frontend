import { Component, OnInit } from '@angular/core';
import { CartService } from '../cart.service';
import {NgForOf} from "@angular/common";
import {KinguinGiftCard} from "../models/KinguinGiftCard";

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems: KinguinGiftCard[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.getCartItems().subscribe(data => {
      this.cartItems = data;
    });
  }

  removeCartItem(cartItemId: number): void {
    this.cartService.removeCartItem(cartItemId).subscribe(() => {
      this.cartItems = this.cartItems.filter(item => item.kinguinId !== cartItemId);
    });
  }

  addCartItem(productId: number, quantity: number): void {
    this.cartService.addCartItem(productId, quantity).subscribe(item => {
      this.cartItems.push(item);
    });
  }

  protected readonly Number = Number;
}
