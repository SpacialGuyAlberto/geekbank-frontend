import {KinguinGiftCard} from "./KinguinGiftCard";

export interface HomeItem {
  id: number;
  productId: number;
}

export interface HomeItemWithGiftcard {
  hihlightItem: HomeItem;
  giftcard: KinguinGiftCard;
}
