import {FlashOfferProduct, FlashOfferProductWithGiftCard} from "./FlashOfferProduct";


export interface FlashSale {
  id?: number;
  products: FlashOfferProductWithGiftCard[];
  temporaryPrice: number;
  createdAt: string;
  limitDate?: string;
  status?: string | 'active' | 'scheduled' | 'paused' | 'expired';
  stockLimit?: number;
  userLimit?: number;
  visibility?: string;
  allowedCountries?: string;
  badge?: string;
  bannerUrl?: string;
}
