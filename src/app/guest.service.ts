// src/app/guest.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GuestService {
  private guestIdKey = 'guestId';

  constructor() { }

  getGuestId(): string {
    let guestId = sessionStorage.getItem(this.guestIdKey);
    if (!guestId) {
      guestId = this.generateUUID();
      sessionStorage.setItem(this.guestIdKey, guestId);
    }
    return guestId;
  }

  private generateUUID(): string {
    // Genera un UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
