// src/app/models/order.model.ts
import {CartItem} from "./CartItem";

export enum PurchaseType {
  Digital = 'Digital',
  Balance = 'Balance'
}

export interface Order {
  id?: string;
  items: CartItem[];
  type: PurchaseType;
  total: number;
  userId: string;
  createdAt?: Date;
}

export interface PurchaseResult {
  success: boolean;
  message: string;
  orderId?: string;
}
