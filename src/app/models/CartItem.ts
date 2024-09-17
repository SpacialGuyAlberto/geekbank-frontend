// Importar la interfaz KinguinGiftCard que ya tienes
import {KinguinGiftCard} from "./KinguinGiftCard";

// Interfaz para el objeto CartItem que recibes del backend
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

// Interfaz que combina CartItem y KinguinGiftCard
export interface CartItemWithGiftcard {
  cartItem: CartItem;
  giftcard: KinguinGiftCard;
}
