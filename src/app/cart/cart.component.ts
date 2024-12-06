// src/app/cart/cart.component.ts
import { Component, OnInit } from '@angular/core';
import { CartService } from '../cart.service';
import { NgForOf, NgIf } from "@angular/common";
import { KinguinGiftCard } from "../models/KinguinGiftCard";
import { RouterLink } from "@angular/router";
import { TigoPaymentComponent } from "../tigo-payment/tigo-payment.component";
import { CartItemWithGiftcard } from "../models/CartItem";
import { BackgroundAnimationService } from "../background-animation.service";
import { CurrencyService } from "../currency.service";
import { FormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from "../auth.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import {RandomKeyMostSoldComponent} from "../random-key-most-sold/random-key-most-sold.component";
import {RecommendationsComponent} from "../recommendations/recommendations.component";
import {PayPalButtonComponent} from "../paypal-button/paypal-button.component";

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    RouterLink,
    TigoPaymentComponent,
    FormsModule,
    MatIcon,
    RandomKeyMostSoldComponent,
    RecommendationsComponent,
    PayPalButtonComponent
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItemWithGiftcard[] = [];
  exchangeRate: number = 0; // Tasa de cambio HNL por 1 EUR
  showDialog: boolean = false;
  protected showPaymentModal: boolean = false;
  cartItemCount: number = 0;
  isLoading: boolean = false;
  totalPriceEUR: number = 0; // Total en EUR
  conversionError: string = '';
  userId: string | null = null;
  showPaypalPaymentModal: boolean = false;
  totalAmountString: string | null = '';
  constructor(
    private cartService: CartService,
    private animation: BackgroundAnimationService,
    private currencyService: CurrencyService,
    private dialog: MatDialog,
    private authService: AuthService,
    private snackBar: MatSnackBar // Inyectar MatSnackBar
  ) {}

  ngOnInit(): void {
    this.animation.initializeGraphAnimation();
    this.loadCartItems();
    this.userId = sessionStorage.getItem('userId');
    console.log('USER ID : ' + this.userId);

    this.cartService.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;
    });
  }

  loadCartItems(): void {
    // this.cartService.loadCartItems().subscribe(data => {
    //   this.cartItems = data;
    //   this.updateCartItemCount();
    //   console.log("Loaded cart items: ", data);
    //   this.calculateTotalPriceEUR();
    //   this.totalAmountString =  this.totalPriceEUR.toString()
    // });

    this.cartService.loadCartItems();

    // Suscribirse a los cambios en cartItems$
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
  }

  /**
   * Calcula el precio total en EUR.
   */
  calculateTotalPriceEUR(): void {
    let total = this.cartItems.reduce((sum, item) => sum + item.cartItem.quantity * item.giftcard.price, 0);
    this.totalPriceEUR = parseFloat(total.toFixed(2));
    this.getExchangeRate();
  }

  /**
   * Obtiene la tasa de cambio EUR a HNL.
   */
  getExchangeRate(): void {
    this.isLoading = true;
    this.conversionError = '';

    this.currencyService.getExchangeRateEURtoHNL(this.totalPriceEUR).subscribe(
      (rate: number) => {
        console.log('Exchange Rate (HNL per EUR):', rate);
        this.exchangeRate = rate;
        this.isLoading = false;
        this.snackBar.open('Tasa de cambio obtenida exitosamente.', 'Cerrar', {
          duration: 3000,
        });
      },
      (error) => {
        console.error('Error al obtener la tasa de cambio:', error);
        this.conversionError = 'Error al obtener la tasa de cambio.';
        this.isLoading = false;
        this.snackBar.open('Error al obtener la tasa de cambio.', 'Cerrar', {
          duration: 3000,
        });
      }
    );
  }

  /**
   * Elimina un ítem del carrito.
   * @param productId ID del producto a eliminar.
   */
  removeCartItem(productId: number): void {
    console.log('Removing item with ID: ' + productId);
    this.cartService.removeCartItem(productId).subscribe(() => {
      this.loadCartItems(); // Recargar los elementos después de la eliminación
    });
  }

  /**
   * Elimina todos los ítems del carrito.
   */
  removeAllCartItems(): void {
    this.cartService.removeAllCartItems().subscribe(() => {
      this.loadCartItems(); // Recargar los elementos después de la eliminación
    });
  }

  /**
   * Incrementa la cantidad de un producto en el carrito.
   * @param item Ítem del carrito.
   */
  incrementProductQuantity(item: CartItemWithGiftcard): void {
    const newQuantity = item.cartItem.quantity + 1;
    this.cartService.updateCartItem(item.cartItem.productId, newQuantity).subscribe(() => {
      item.cartItem.quantity = newQuantity;
      this.updateCartItemCount();
      console.log('Increased quantity:', item);
      this.calculateTotalPriceEUR(); // Actualizar el total en EUR después de cambiar la cantidad
    });
  }

  /**
   * Decrementa la cantidad de un producto en el carrito.
   * @param item Ítem del carrito.
   */
  decreaseProductQuantity(item: CartItemWithGiftcard): void {
    if (item.cartItem.quantity > 1) {
      const newQuantity = item.cartItem.quantity - 1;
      this.cartService.updateCartItem(item.cartItem.productId, newQuantity).subscribe(() => {
        item.cartItem.quantity = newQuantity;
        this.updateCartItemCount();
        console.log('Decreased quantity:', item);
        this.calculateTotalPriceEUR(); // Actualizar el total en EUR después de cambiar la cantidad
      });
    } else {
      // Si la cantidad llega a 0, eliminar el ítem del carrito
      this.cartService.removeCartItem(item.cartItem.productId).subscribe(() => {
        this.cartItems = this.cartItems.filter(cartItem => cartItem.cartItem.productId !== item.cartItem.productId);
        this.updateCartItemCount();
        this.showDialog = true;
        setTimeout(() => {
          this.closeDialog();
        }, 3000);
        console.log('Removed item from cart:', item);
        this.calculateTotalPriceEUR(); // Actualizar el total en EUR después de eliminar el ítem
      });
    }
  }

  /**
   * Abre el modal de pago.
   */
  openPaymentModal(): void {
    if (this.cartItems.length === 0) {
      this.snackBar.open('No hay items en el carrito.', 'Cerrar', {
        duration: 3000,
      });
      return; // Evitar abrir el modal si no hay items
    }
    this.showPaymentModal = true;
    console.log('Total en HNL:', this.totalPriceEUR * this.exchangeRate);
  }

  /**
   * Cierra el diálogo de notificación.
   */
  closeDialog(): void {
    this.showDialog = false;
  }

  /**
   * Calcula y retorna el precio total en EUR.
   */
  getTotalPrice(): number {
    return this.totalPriceEUR;
  }

  /**
   * Actualiza el conteo de ítems en el carrito.
   */
  updateCartItemCount(): void {
    this.cartService.updateCartItemCount();
    console.log(this.cartItemCount);
  }

  protected readonly Number = Number;
}
