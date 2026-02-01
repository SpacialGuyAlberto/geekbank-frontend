export interface Combo {
  id?: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isActive: boolean;
  productIds: number[];
  // Los productos completos vendrían del backend si se necesitan mostrar detalles
  products?: any[];
}
