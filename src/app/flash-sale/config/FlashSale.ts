export interface FlashSale {
  id?: number;
  productId: number;

  // Precios
  originalPrice: number;
  temporaryPrice: number;

  // Fechas
  createdAt: string;
  limitDate: string;
  // Estado
  status: 'scheduled' | 'active' | 'paused';
}
