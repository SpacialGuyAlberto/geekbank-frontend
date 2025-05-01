import {Promotion} from "../../../promotions/Promotion.model";
import {CartItemWithGiftcard} from "../../../cart/CartItem";
import {User} from "../../../user-details/User";

export interface OrderContext {
  user?: User | null;
  guestId?: string | null;
  items: CartItemWithGiftcard[];
  promo?: Promotion;
  productId?: number | null;
  manual?: boolean;
  phone?: string;
  email?: string;
  gameUserId?: number;
  sendSMS?: boolean;
}
