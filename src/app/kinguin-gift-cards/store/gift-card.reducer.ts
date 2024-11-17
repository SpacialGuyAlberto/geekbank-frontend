// src/app/features/gift-card/store/gift-card.reducer.ts
import { createReducer, on } from '@ngrx/store';
import * as GiftCardActions from './gift-card.actions';
import { GiftCardState, initialGiftCardState } from '../models/gift-card.state';

export const giftCardReducer = createReducer(
  initialGiftCardState,

  // Cargar Gift Cards
  on(GiftCardActions.loadGiftCards, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(GiftCardActions.loadGiftCardsSuccess, (state, { giftCards }) => ({
    ...state,
    loading: false,
    giftCards
  })),

  on(GiftCardActions.loadGiftCardsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Cargar detalles de una Gift Card
  on(GiftCardActions.loadGiftCardDetails, state => ({
    ...state,
    loading: true,
    error: null,
    selectedGiftCard: null
  })),

  on(GiftCardActions.loadGiftCardDetailsSuccess, (state, { giftCard }) => ({
    ...state,
    loading: false,
    selectedGiftCard: giftCard
  })),

  on(GiftCardActions.loadGiftCardDetailsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  // src/app/features/gift-card/store/gift-card.reducer.ts
  on(GiftCardActions.loadGiftCardsPage, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(GiftCardActions.loadGiftCardsPageSuccess, (state, { giftCards }) => ({
    ...state,
    loading: false,
    giftCards: [...state.giftCards, ...giftCards] // Concatenar nuevas gift cards
  })),
  on(GiftCardActions.loadGiftCardsPageFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

);
