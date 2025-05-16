import { KinguinGiftCard } from "../kinguin-gift-cards/KinguinGiftCard";
import { GiftcardClassification } from "./giftcard-classification.enum";

export interface MainScreenGiftCardItem {
  id?: number;
  productId: number;
  classification?: GiftcardClassification;
  createdAt?: Date;
}
export interface MainScreenGiftCardItemDTO {
  mainScreenGiftCardItem: MainScreenGiftCardItem;
  giftcard: KinguinGiftCard;
}
