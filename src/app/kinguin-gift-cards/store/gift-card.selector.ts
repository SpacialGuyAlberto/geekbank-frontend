// src/app/features/gift-card/store/gift-card.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GiftCardState } from '../models/gift-card.state';

// store/gift-card.selectors.ts
export const selectGiftCardState = createFeatureSelector<GiftCardState>('giftCards'); // 'giftCards' debe coincidir con la clave en forFeature


export const selectAllGiftCards = createSelector(
  selectGiftCardState,
  (state: GiftCardState) => state.giftCards
);

export const selectGiftCardsLoading = createSelector(
  selectGiftCardState,
  (state: GiftCardState) => state.loading
);

export const selectGiftCardsError = createSelector(
  selectGiftCardState,
  (state: GiftCardState) => state.error
);

export const selectSelectedGiftCard = createSelector(
  selectGiftCardState,
  (state: GiftCardState) => state.selectedGiftCard
);
