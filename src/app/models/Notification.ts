export interface Notification {
  id: number;
  message: string;
  timestamp: Date;
  read: boolean;
  imageUrl?: string;
  transactionId?: number; // ID de la transacción, si aplica
  productId?: number; // ID del producto, si aplica
  activityId?: number;
}
