import { Injectable } from '@angular/core';
import { environment } from "../environments/environment";
import { BehaviorSubject, map, Observable } from "rxjs";
import { KinguinGiftCard } from "./models/KinguinGiftCard";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { WishItemWithGiftcard } from "./models/WishItem";

@Injectable({
  providedIn: 'root'
})
export class WishListService {
  private apiUrl = environment.apiUrl;
  private baseUrl = `${this.apiUrl}/wish-list`;
  private wishItemCountSubject = new BehaviorSubject<number>(0);
  private wishItems: WishItemWithGiftcard[] = [];

  constructor(private http: HttpClient) {}

  getWishItems(): Observable<WishItemWithGiftcard[]> {
    return this.http.get<WishItemWithGiftcard[]>(this.baseUrl, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
    });
  }

  addWishItem(productId: number, price: number): Observable<KinguinGiftCard> {
    return this.http.post<KinguinGiftCard>(this.baseUrl, { productId, price }, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
    });
  }

  removeWishItem(wishItemId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${wishItemId}`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
    });
  }

  isItemInWishList(kinguinId: number): Observable<boolean> {
    console.log('ID IN wishlist SERVICE: ' + kinguinId);
    return this.getWishItems().pipe(
      map(wishItems => {
        return wishItems.some(item => parseInt(String(item.wishedItem.productId)) === kinguinId);
      })
    );
  }

  removeAllWishItems(): Observable<any> {
    return this.http.delete(this.baseUrl, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
    });
  }
}
