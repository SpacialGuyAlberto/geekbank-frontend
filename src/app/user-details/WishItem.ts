
import {KinguinGiftCard} from "../kinguin-gift-cards/KinguinGiftCard";

export interface WishItemWithGiftcard {
  wishedItem: {
    id: number;
    user: {
      id: number;
      name: string;
      email: string;
      // ... otras propiedades del usuario
    };
    productId: number;
    quantity: number;
    price: number;
  };
  giftCard: KinguinGiftCard;
}


