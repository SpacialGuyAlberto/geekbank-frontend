import {KinguinGiftCard} from "../kinguin-gift-cards/KinguinGiftCard";

export interface MainScreenGiftCardItem {
  id: number;
  productId: number;
}
export interface MainScreenGiftCardItemDTO {
  hihlightItem: MainScreenGiftCardItem;
  giftcard: KinguinGiftCard;
}
