// src/app/features/gift-card/store/gift-card.actions.ts
import { createAction, props } from '@ngrx/store';
import {KinguinGiftCard} from "../../models/KinguinGiftCard";

// Cargar Gift Cards
export const loadGiftCards = createAction('[GiftCard] Load GiftCards');

export const loadGiftCardsSuccess = createAction(
  '[GiftCard] Load GiftCards Success',
  props<{ giftCards: KinguinGiftCard[] }>()
);

export const loadGiftCardsFailure = createAction(
  '[GiftCard] Load GiftCards Failure',
  props<{ error: any }>()
);

// Cargar detalles de una Gift Card
export const loadGiftCardDetails = createAction(
  '[GiftCard] Load GiftCard Details',
  props<{ id: string }>()
);

export const loadGiftCardDetailsSuccess = createAction(
  '[GiftCard] Load GiftCard Details Success',
  props<{ giftCard: KinguinGiftCard }>()
);

export const loadGiftCardDetailsFailure = createAction(
  '[GiftCard] Load GiftCard Details Failure',
  props<{ error: any }>()
);


// src/app/features/gift-card/store/gift-card.actions.ts
export const loadGiftCardsPage = createAction(
  '[GiftCard] Load GiftCards Page',
  props<{ page: number }>()
);

export const loadGiftCardsPageSuccess = createAction(
  '[GiftCard] Load GiftCards Page Success',
  props<{ giftCards: KinguinGiftCard[] }>()
);

export const loadGiftCardsPageFailure = createAction(
  '[GiftCard] Load GiftCards Page Failure',
  props<{ error: any }>()
);

