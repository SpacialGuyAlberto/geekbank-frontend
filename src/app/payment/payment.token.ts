// src/app/payment/payment.tokens.ts
import { InjectionToken } from '@angular/core';
import { CartItemWithGiftcard } from '../cart/CartItem';

export const CART_ITEMS = new InjectionToken<CartItemWithGiftcard[]>('cartItems');
export const TOTAL_PRICE = new InjectionToken<number>('totalPrice');
export const PRODUCT_ID = new InjectionToken<number | null>('productId');
export const GAME_USER_ID = new InjectionToken<number | null>('gameUserId');
export const IS_MANUAL_TRANSACTION = new InjectionToken<boolean>('isManualTransaction');
