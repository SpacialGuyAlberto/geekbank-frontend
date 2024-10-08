// src/app/models/notification.model.ts
export interface Notification {
  id: number;
  message: string;
  timestamp: Date;
  read: boolean;
  imageUrl?: string;
}
