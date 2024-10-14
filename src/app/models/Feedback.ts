


// Importar la interfaz KinguinGiftCard que ya tienes
// import {KinguinGiftCard} from "./KinguinGiftCard";
// // Interfaz para el objeto CartItem que recibes del backend
// export interface WishItemWithGiftcard {
//   wishedItem: {
//     id: number;
//     user: {
//       id: number;
//       name: string;
//       email: string;
//       // ... otras propiedades del usuario
//     };
//     productId: number;
//     quantity: number;
//     price: number;
//   };
//   giftCard: KinguinGiftCard;
// }
//

import {User} from "./User";
import {KinguinGiftCard} from "./KinguinGiftCard";
import {DateAdapter} from "@angular/material/core";

export interface Feedback {
  id: number;
  score: number;
  message: string;
  user?: User;
  productId: string;
  createdAt: Date;
}
