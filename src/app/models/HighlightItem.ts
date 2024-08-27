import {KinguinGiftCard} from "./KinguinGiftCard";

export interface HighlightItem {
  id: number;
  productId: number;
}

export interface HighlightItemWithGiftcard {
  hihlightItem: HighlightItem;
  giftcard: KinguinGiftCard;
}
