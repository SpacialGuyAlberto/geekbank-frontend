
export interface FlashOfferDto {
  id?: number;
  productId: number;
  createdAt?: string;
  limitDate: string;
  temporaryPrice: number;
}

export class FlashOfferModel {
  constructor(
    public id: number | null,
    public productId: number,
    public createdAt: Date,
    public limitDate: Date,
    public temporaryPrice: number
  ) {}

  static fromDto(dto: FlashOfferDto): FlashOfferModel {
    return new FlashOfferModel(
      dto.id ?? null,
      dto.productId,
      dto.createdAt ? new Date(dto.createdAt) : new Date(),
      new Date(dto.limitDate),
      dto.temporaryPrice
    );
  }
  toDto(): FlashOfferDto {
    return {
      id: this.id ?? undefined,
      productId: this.productId,
      createdAt: this.createdAt.toISOString(),
      limitDate: this.limitDate.toISOString(),
      temporaryPrice: this.temporaryPrice
    };
  }

  isActive(): boolean {
    return this.limitDate.getTime() > Date.now();
  }
  timeRemainingHours(): number {
    const diffMs = this.limitDate.getTime() - Date.now();
    return Math.max(0, Math.floor(diffMs / 1000 / 60 / 60));
  }
}
