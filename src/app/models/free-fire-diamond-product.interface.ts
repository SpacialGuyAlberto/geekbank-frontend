// free-fire-diamond-product.interface.ts
export interface FreeFireDiamondProduct {
  productId: number;
  name: string;
  denomination: string; // Representará el valor del enum como un string
  price: number;
  description: string;
  imageUrl: string;
}
