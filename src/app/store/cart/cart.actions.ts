import { createAction, props } from '@ngrx/store';
import { KinguinGiftCard } from '../../kinguin-gift-cards/KinguinGiftCard';

export const addCartItem = createAction(
  '[Cart] Add Cart Item',
  props<{ item: KinguinGiftCard }>()
);

export const removeCartItem = createAction(
  '[Cart] Remove Cart Item',
  props<{ kinguinId: number }>()
);

export const updateCartItem = createAction(
  '[Cart] Update Cart Item',
  props<{ kinguinId: number, quantity: number }>()
);

export const clearCart = createAction(
  '[Cart] Clear Cart'
);
