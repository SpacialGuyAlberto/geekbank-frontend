// transaction.model.ts

export interface TransactionProduct {
  id: number;
  productId: number;
  quantity: number;
  image?: string;
  name?: string;
  price?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Account {
  id: number;
  accountNumber: string;
  balance: number;
}

export interface Transaction {
  id: number;
  transactionNumber: string;
  amount: number;
  phoneNumber: string;
  type: string;
  timestamp: string;
  status: string;
  description: string;
  user: User | null;
  account: Account | null;
  products: TransactionProduct[];
  keys?: string[] | undefined
}
