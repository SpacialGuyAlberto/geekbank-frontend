import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartNotificationService {
  private cartItemCountSource = new BehaviorSubject<number>(this.getInitialCartItemCount());
  cartItemCount$: Observable<number> = this.cartItemCountSource.asObservable();

  updateCartItemCount(count: number): void {
    this.cartItemCountSource.next(count);
    localStorage.setItem('cartItemCount', JSON.stringify(count));
  }

  getInitialCartItemCount(): number {
    const storedCount = localStorage.getItem('cartItemCount');
    return storedCount ? JSON.parse(storedCount) : 0;
  }
}
