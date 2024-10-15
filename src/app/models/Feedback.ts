
export interface Feedback {
  id?: number;
  score: number;
  message: string;
  userId?: string | null;
  giftCardId: string;
  createdAt: Date;
}
