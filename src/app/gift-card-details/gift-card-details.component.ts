// src/app/gift-card-details/gift-card-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KinguinService } from "../kinguin.service";
import { KinguinGiftCard } from "../models/KinguinGiftCard";
import { CurrencyPipe } from "@angular/common";
import { CommonModule } from "@angular/common";
import { Router } from '@angular/router';
import { CartService } from '../cart.service';
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";

@Component({
  selector: 'app-gift-card-details',
  standalone: true,
  imports: [
    CurrencyPipe,
    CommonModule,
    MatSnackBarModule
  ],
  templateUrl: './gift-card-details.component.html',
  styleUrl: './gift-card-details.component.css'
})
export class GiftCardDetailsComponent implements OnInit {
  giftCard: KinguinGiftCard | undefined;
  isInCart: boolean = false;
  quantityInCart: number = 0;

  constructor(
    private route: ActivatedRoute,
    private kinguinService: KinguinService,
    private router: Router,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.kinguinService.getGiftCardDetails(id).subscribe(data => {
        data.coverImageOriginal = data.images.cover?.thumbnail || '';
        data.coverImage = data.images.cover?.thumbnail || '';
        this.giftCard = data;
        this.checkIfInCart(data.kinguinId);
      });
    }
  }

  checkIfInCart(kinguinId: number): void {
    this.cartService.getCartItems().subscribe(cartItems => {
      const itemInCart = cartItems.find(item => item.kinguinId === kinguinId);
      this.isInCart = !!itemInCart;
      this.quantityInCart = itemInCart ? itemInCart.qty : 0;
    });
  }

  toggleCart(giftCard: KinguinGiftCard): void {
    if (this.isInCart) {
      this.cartService.removeCartItem(giftCard.kinguinId).subscribe(() => {
        this.isInCart = false;
        this.quantityInCart = 0;
        this.showSnackBar('Product removed from cart');
      });
    } else {
      this.cartService.addCartItem(giftCard.kinguinId, 1).subscribe(() => {
        this.isInCart = true;
        this.quantityInCart = 1;
        this.showSnackBar('Product added to cart: ' + giftCard.kinguinId);
      });
    }
  }

  showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }

  buyNow(giftCard: KinguinGiftCard): void {
    // Implement buy now functionality
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
