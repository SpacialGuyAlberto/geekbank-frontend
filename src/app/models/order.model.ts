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
  createdAt: Date; // LocalDateTime mapeado a Date en TypeScript
  transaction?: Transaction; // Transacción relacionada
  products?: TransactionProduct[]; // Lista de productos asociados
}

export interface Transaction {
  id: number;
  transactionDetails: string; // Agregar las propiedades específicas según tu implementación
}

export interface TransactionProduct {
  id: number;
  productName: string; // Agregar las propiedades específicas según tu implementación
}
