// src/app/features/gift-card/models/gift-card.state.ts
import {KinguinGiftCard} from "../../models/KinguinGiftCard";

export interface GiftCardState {
  giftCards: KinguinGiftCard[];
  selectedGiftCard: KinguinGiftCard | null;
  loading: boolean;
  error: any;
}

export const initialGiftCardState: GiftCardState = {
  giftCards: [],
  selectedGiftCard: null,
  loading: false,
  error: null
};
