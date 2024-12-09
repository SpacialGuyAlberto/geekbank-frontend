// src/app/payment/models/order-details.model.ts
export interface OrderRequest {
  userId?: number | null;
  guestId?: string | null;
  email?: string | null;
  sendKeyToSMS?: boolean;
  phoneNumber: string;
  products: Product[];
  amount: number;
  manual: boolean;
  gameUserId?: number;
  refNumber?: string;
}

export interface Product {
  kinguinId: number;
  qty: number;
  price: number;
  name?: string;
}

export enum PurchaseType {
  GIFTCARD = 'GIFTCARD',
  BALANCE = 'BALANCE'
}
// PURCHASE,
//   BALANCE_PURCHASE,
