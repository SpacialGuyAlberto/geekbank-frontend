import {KinguinGiftCard} from "../../../kinguin-gift-cards/KinguinGiftCard";

export interface FlashOfferProduct {
  productId?: number;
  productName?: string;
  originalPrice?: number;
  temporaryPrice?: number;
}

export interface FlashOfferProductWithGiftCard {
  FlashOfferProduct: FlashOfferProduct;
  KinguinGiftCard: KinguinGiftCard;
}
