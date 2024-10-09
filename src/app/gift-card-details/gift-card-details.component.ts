// src/app/gift-card-details/gift-card-details.component.ts
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KinguinService } from "../kinguin.service";
import { KinguinGiftCard } from "../models/KinguinGiftCard";
import { CurrencyPipe } from "@angular/common";
import { CommonModule } from "@angular/common";
import { Router } from '@angular/router';
import { CartService } from '../cart.service';
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import {BackgroundAnimationService} from "../background-animation.service";
import {CartComponent} from "../cart/cart.component";
import {CurrencyService} from "../currency.service";
import {FormsModule} from "@angular/forms";
import {AuthService} from "../auth.service";
import {NotificationService} from "../services/notification.service";
import {ToastrModule} from "ngx-toastr";

@Component({
  selector: 'app-gift-card-details',
  standalone: true,
  imports: [
    CurrencyPipe,
    CommonModule,
    MatSnackBarModule,
    FormsModule,
  ],
  templateUrl: './gift-card-details.component.html',
  styleUrl: './gift-card-details.component.css'
})
export class GiftCardDetailsComponent implements OnInit {

  giftCard: KinguinGiftCard | undefined;
  isInCart: boolean = false;
  cartItemCount: number = 0;
  exchangeRate: number = 0;
  quantityInCart: number = 0;
  notifMessage: string = '';
  isFeedbackModalOpen: boolean = false;
  feedbackMessage: string = '';

  @Output() cartItemCountChange: EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private kinguinService: KinguinService,
    private router: Router,
    private cartService: CartService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private animation: BackgroundAnimationService,
    private currencyService: CurrencyService
  ) { }

  ngOnInit(): void {
    this.animation.initializeGraphAnimation();
    this.fetchCurrencyExchange();
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

  openFeedbackModal(): void {
    this.isFeedbackModalOpen = true;
  }

  closeFeedbackModal(): void {
    this.isFeedbackModalOpen = false;
    this.feedbackMessage = '';
  }

  submitFeedback(): void {
    console.log('Feedback enviado:', this.feedbackMessage);
    // Aquí podrías implementar la lógica para enviar el feedback a la API
    this.closeFeedbackModal();
  }

  // loadCartItems(): void {
  //   this.cartService.getCartItems().subscribe(data => {
  //     this.cartItems = data;
  //     this.updateCartItemCount();
  //     console.log("Loaded cart items: ", data);
  //   });
  // }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  checkIfInCart(kinguinId: number): void {
    this.cartService.isItemInCart(kinguinId).subscribe(isInCart => {
      this.isInCart = isInCart;
      console.log(`isInCart is now: ${this.isInCart}`);
      if (this.isInCart) {
        this.cartService.getCartItems().subscribe(cartItems => {
          const itemInCart = cartItems.find(item => item.cartItem.productId === kinguinId);
          if (itemInCart) {
            this.quantityInCart = itemInCart.cartItem.quantity;
            console.log(`Item found in cart: ${JSON.stringify(itemInCart)}`);
          }
          this.emitCartItemCount();
        });
      } else {
        this.quantityInCart = 0;
        console.log('Item not found in cart.');
        this.emitCartItemCount();
      }
    });
  }

  loadCartItemCount(): void {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItemCount = items.reduce((count, item) => count + 1, 0)
    });
  }

  toggleCart(giftCard: KinguinGiftCard): void {
    if (!this.isLoggedIn()) {
      this.showSnackBar('You are not login. Please log in to add your products to the cart');
      return;
    }

    if (this.isInCart) {
      this.cartService.removeCartItem(giftCard.kinguinId).subscribe(() => {
        this.isInCart = false;
        this.quantityInCart = 0;
        this.emitCartItemCount();
        this.notifMessage = `You removed ${giftCard.name} from cart.`
        this.notificationService.addNotification(this.notifMessage, giftCard.coverImage);
        this.showSnackBar('Product removed from cart');
      });
    } else {
      this.cartService.addCartItem(giftCard.kinguinId, 1, giftCard.price).subscribe(() => {
        this.isInCart = true;
        this.quantityInCart = 1;
        this.emitCartItemCount();
        this.notifMessage = `You added ${giftCard.name} to cart.`
        this.showSnackBar('Product added to cart: ' + giftCard.kinguinId);
        this.notificationService.addNotification(this.notifMessage, giftCard.coverImage);
      });
    }
    this.loadCartItemCount();
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }

  emitCartItemCount(): void {
    this.cartService.getCartItems().subscribe(cartItems => {
      const totalCount = cartItems.reduce((total, item) => total + item.cartItem.quantity, 0);
      this.cartService.updateCartItemCount(totalCount);
    });
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

  fetchCurrencyExchange(): void {
    this.currencyService.getCurrency().subscribe(data => {
      this.exchangeRate = data['conversion_rate']
    });
  }
}
