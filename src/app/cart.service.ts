// src/app/cart.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {KinguinGiftCard} from "./models/KinguinGiftCard";

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private baseUrl = 'http://localhost:7070/api/cart';

  constructor(private http: HttpClient) {}

  getCartItems(): Observable<KinguinGiftCard[]> {
    return this.http.get<any[]>(this.baseUrl, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
    }).pipe(
      map(items => items.map(item => ({
        ...item,
        productId: item.productId,
        quantity: item.quantity
      })))
    );
  }

  addCartItem(productId: number, quantity: number): Observable<KinguinGiftCard> {
    return this.http.post<KinguinGiftCard>(this.baseUrl, { productId, quantity }, {
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
}
