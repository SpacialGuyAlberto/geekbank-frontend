// cart.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { addCartItem, removeCartItem, updateCartItem, clearCart } from './cart.actions';
import { KinguinGiftCard } from '../../models/KinguinGiftCard';

export interface CartState {
  items: KinguinGiftCard[];
}

export const initialState: CartState = {
  items: []
};

export const cartReducer = createReducer(
  initialState,
  on(addCartItem, (state, { item }) => ({
    ...state,
    items: [...state.items, item]
  })),
  on(removeCartItem, (state, { kinguinId }) => ({
    ...state,
    items: state.items.filter(item => item.kinguinId !== kinguinId)
  })),
  on(updateCartItem, (state, { kinguinId, quantity }) => ({
    ...state,
    items: state.items.map(item => item.kinguinId === kinguinId ? { ...item, quantity } : item)
  })),
  on(clearCart, state => ({
    ...state,
    items: []
  }))
);
