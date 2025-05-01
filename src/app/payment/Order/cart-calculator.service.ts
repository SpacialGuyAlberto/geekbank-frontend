import { Injectable } from '@angular/core';
import {CartItemWithGiftcard} from "../../cart/CartItem";
import {Promotion} from "../../promotions/Promotion.model";

@Injectable({
  providedIn: 'root'
})
export class CartCalculatorService {

  constructor() { }

  totalEUR(items: CartItemWithGiftcard[], promo?: Promotion): number {
    const raw = items.reduce((s, i) => s + i.cartItem.quantity * i.giftcard.price, 0);
    return +(promo ? raw * (1 - promo.discountPorcentage / 100) : raw).toFixed(2);
  }

  totalHNL(items: CartItemWithGiftcard[], promo?: Promotion): number {
    const raw = items.reduce((s, i) => s + i.cartItem.quantity * i.giftcard.priceHNL, 0);
    return +(promo ? raw * (1 - promo.discountPorcentage / 100) : raw).toFixed(2);
  }

}
