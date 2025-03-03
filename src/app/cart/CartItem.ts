// Importar la interfaz KinguinGiftCard que ya tienes
import {KinguinGiftCard} from "../kinguin-gift-cards/KinguinGiftCard";

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CartItemWithGiftcard {
  cartItem: CartItem;
  giftcard: KinguinGiftCard;
}
