// transaction.model.ts

export interface TransactionProduct {
  id: number;
  productId: number;
  quantity: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  // Otros campos según sea necesario
}

export interface Account {
  id: number;
  accountNumber: string;
  balance: number;
  // Otros campos según sea necesario
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
}
