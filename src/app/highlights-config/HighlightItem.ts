import {KinguinGiftCard} from "../kinguin-gift-cards/KinguinGiftCard";

export interface HighlightItem {
  id: number;
  productId: number;
}

export interface HighlightItemWithGiftcard {
  hihlightItem: HighlightItem;
  giftcard: KinguinGiftCard;
}
