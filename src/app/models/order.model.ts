export interface Order {
  id?: number; // opcional para creación
  orderRequestId: string;
  userId?: number;
  guestId?: string;
  gameUserId?: number;
  manual: boolean;
  phoneNumber?: string;
  amount: number;
  refNumber?: string;
  createdAt: Date;
  transaction?: Transaction;
  products?: TransactionProduct[];
}

export interface Transaction {
  id: number;
  transactionDetails: string;
}

export interface TransactionProduct {
  id: number;
  productName: string;
}
