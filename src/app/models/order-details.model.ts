// src/app/payment/models/order-details.model.ts
export interface OrderDetails {
  userId?: number;
  guestId?: string;
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
