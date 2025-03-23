import {KinguinGiftCard} from "../kinguin-gift-cards/KinguinGiftCard";

export interface HighlightItem {
  id?: number;
  productId: number;
  imageUrl: string;
  title: string;
  price: number;
}

export interface HighlightItemWithGiftcard {
  hihlightItem: HighlightItem;
  giftcard: KinguinGiftCard;
}
