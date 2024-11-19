// Importar la interfaz KinguinGiftCard que ya tienes
import {KinguinGiftCard} from "./KinguinGiftCard";

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
