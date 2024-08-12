import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable, BehaviorSubject, map} from 'rxjs';
import { KinguinGiftCard } from './models/KinguinGiftCard';
import {CartItemWithGiftcard} from "./models/CartItem";

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private baseUrl = 'http://localhost:7070/api/cart';
  private cartItemCountSubject = new BehaviorSubject<number>(0);
  cartItemCount$: Observable<number> = this.cartItemCountSubject.asObservable();
  private cartItems: KinguinGiftCard[] = [];


  constructor(private http: HttpClient) {}

  getCartItems(): Observable<CartItemWithGiftcard[]> {
    return this.http.get<CartItemWithGiftcard[]>(this.baseUrl, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
    });
  }

  addCartItem(productId: number, quantity: number, price: number): Observable<KinguinGiftCard> {
    return this.http.post<KinguinGiftCard>(this.baseUrl, { productId, quantity, price }, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
    });
  }
  updateCartItem(productId: number, quantity: number): Observable<KinguinGiftCard> {
    return this.http.put<KinguinGiftCard>(this.baseUrl, { productId, quantity }, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
    });
  }

  removeCartItem(cartItemId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${cartItemId}`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
    });
  }

  isItemInCart(kinguinId: number): Observable<boolean> {
    console.log('ID IN CART SERVICE: ' + kinguinId);
    return this.getCartItems().pipe(
      map(cartItems => {
        return cartItems.some(item => parseInt(String(item.cartItem.productId)) === kinguinId);
      })
    );
  }


  removeAllCartItems(): Observable<any> {
    return this.http.delete(this.baseUrl, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
    });
  }

  updateCartItemCount(count: number): void {
    this.cartItemCountSubject.next(count);
    localStorage.setItem('cartItemCount', JSON.stringify(count));
  }
}
