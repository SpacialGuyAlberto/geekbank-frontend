import { Injectable } from '@angular/core';
import {OrderContext} from "../Models/OrderContext";
import {OrderRequest} from "../../../models/order-request.model";
import {CartCalculatorService} from "../cart-calculator.service";

@Injectable({
  providedIn: 'root'
})
export class OrderFactoryService {
  constructor(private calc: CartCalculatorService) {}

  build(ctx: OrderContext): OrderRequest {
    if (!ctx.items.length && ctx.productId == null) {
      throw new Error('No hay items ni productId');
    }

    const amount = ctx.items.length
      ? this.calc.totalHNL(ctx.items, ctx.promo)
      : ctx.items[0]?.giftcard.priceHNL ?? 0;

    return {
      userId   : ctx.user?.id ?? null,
      guestId  : ctx.guestId ?? null,
      phoneNumber: ctx.phone ?? '',
      email    : ctx.email ?? '',
      products : ctx.items.length
        ? ctx.items.map(i => ({
          kinguinId: i.cartItem.productId,
          qty      : i.cartItem.quantity,
          price    : i.giftcard.priceHNL,
          name     : i.giftcard.name
        }))
        : [{ kinguinId: ctx.productId!, qty: 1, price: amount, name: 'Producto' }],
      amount   : amount,
      manual   : ctx.manual ?? false,
      sendKeyToSMS: ctx.sendSMS ?? false,
      gameUserId  : ctx.gameUserId,
      promoCode   : ctx.promo?.code
    };
  }
}
