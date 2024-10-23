// src/app/models/order-request.model.ts
export interface Product {
  kinguinId: number;
  qty: number;
  price: number;
  name?: string; // Opcional, según necesidad
}

export interface OrderRequest {
  userId?: number;    // Opcional: presente solo si el usuario está autenticado
  guestId?: string;   // Opcional: presente solo si el usuario es invitado
  phoneNumber: string;
  products: Product[];
  amount: number;
}
