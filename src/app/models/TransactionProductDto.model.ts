export interface TransactionProductDto {
  productId: number;
  quantity: number;
  price: number;
}

export interface ManualVerificationTransactionDto {
  transactionNumber: string;
  amountUsd: number;
  amountHnl: number;
  exchangeRate: number;
  timestamp: string; // Almacena la fecha y hora en formato ISO string
  phoneNumber: string;
  userOrGuest: string;
  products: TransactionProductDto[];
}
