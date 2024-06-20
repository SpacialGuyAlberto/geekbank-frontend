// src/app/services/models/KinguinGiftCard.ts

export interface KinguinGiftCard {
  name: string;
  description: string;
  coverImage: string;
  coverImageOriginal: string;
  developers: string[];
  publishers: string[];
  genres: string[];
  platform: string;
  releaseDate: string;
  qty: number;
  textQty: number;
  price: number;
  cheapestOfferId: string[];
  isPreorder: boolean;
  regionalLimitations: string;
  regionId: number;
  activationDetails: string;
  kinguinId: number;
  productId: string;
  originalName: string;
  screenshots: Screenshot[];
  videos: Video[];
  languages: string[];
  systemRequirements: SystemRequirement[];
  tags: string[];
  offers: Offer[];
  offersCount: number;
  totalQty: number;
  merchantName: string[];
  ageRating: string;
  images: Images;
  updatedAt: string;
}

export interface Screenshot {
  url: string;
  urlOriginal: string;
}

export interface Video {
  name: string;
  videoId: string;
}

export interface SystemRequirement {
  system: string;
  requirement: string[];
}

export interface Offer {
  name: string;
  offerId: string;
  price: number;
  qty: number;
  textQty: number;
  availableQty: number;
  availableTextQty: number;
  merchantName: string;
  isPreorder: boolean;
  releaseDate: string;
}

export interface Images {
  screenshots: Screenshot[];
  cover: Cover;
}

export interface Cover {
  thumbnail: string;
}
