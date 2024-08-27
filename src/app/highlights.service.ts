import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {KinguinGiftCard} from "./models/KinguinGiftCard";
import {CartItemWithGiftcard} from "./models/CartItem";
import {HighlightItemWithGiftcard} from "./models/HighlightItem";

@Injectable({
  providedIn: 'root'
})
export class HighlightService {

  private apiUrl = 'http://127.0.0.1:7070/api/highlights'; // URL base de tu API

  constructor(private http: HttpClient) { }

  getHighlights(): Observable<HighlightItemWithGiftcard[]> {
    return this.http.get<HighlightItemWithGiftcard[]>(`${this.apiUrl}`);
  }

  // getCartItems(): Observable<CartItemWithGiftcard[]> {
  //   return this.http.get<CartItemWithGiftcard[]>(this.baseUrl, {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${localStorage.getItem('token')}`
  //     })
  //   });
  // }

  addHighlights(productIds: number[]): Observable<any> {
    const requestBody = { productIds };
    console.log(requestBody);
    return this.http.post(`${this.apiUrl}`, requestBody);
  }




  // updateCartItem(productId: number, quantity: number): Observable<KinguinGiftCard> {
  //   return this.http.put<KinguinGiftCard>(this.baseUrl, { productId, quantity }, {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${localStorage.getItem('token')}`
  //     })
  //   });
  // }

  removeHighlights(productIds: number[]): Observable<void> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.delete<void>(`${this.apiUrl}`, {  body: productIds });
  }
}


