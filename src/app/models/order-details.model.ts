export interface OrderDetails {
  userId?: number | null;
  guestId?: string | null;
  phoneNumber: string;
  products: Product[];
  amount: number;
  manual: boolean;
  gameUserId?: number;
}

export interface Product {
  kinguinId: number;
  qty: number;
  price: number;
  name?: string;
}
