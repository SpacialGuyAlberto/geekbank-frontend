import { Injectable } from '@angular/core';
import { environment } from "../../../../environments/environment";
import { BehaviorSubject, map, Observable } from "rxjs";
import { KinguinGiftCard } from "../../../kinguin-gift-cards/KinguinGiftCard";
import { HttpClient } from "@angular/common/http";
import { WishItemWithGiftcard } from "../../WishItem";

@Injectable({
  providedIn: 'root'
})
export class WishListService {
  private apiUrl = environment.apiUrl;
  private baseUrl = `${this.apiUrl}/wish-list`;
  private wishItemCountSubject = new BehaviorSubject<number>(0);
  private wishItems: WishItemWithGiftcard[] = [];

  constructor(private http: HttpClient) {}

  /**
   * Obtiene un ítem de la lista de deseos por su ID.
   */
  getWishItem(id: string): Observable<WishItemWithGiftcard> {
    return this.http.get<WishItemWithGiftcard>(`${this.baseUrl}/${id}`, {
      withCredentials: true // Envía cookies de sesión automáticamente
    });
  }

  /**
   * Obtiene todos los ítems de la lista de deseos.
   */
  getWishItems(): Observable<WishItemWithGiftcard[]> {
    return this.http.get<WishItemWithGiftcard[]>(this.baseUrl, {
      withCredentials: true
    });
  }

  /**
   * Agrega un ítem a la lista de deseos.
   */
  addWishItem(productId: number, price: number): Observable<KinguinGiftCard> {
    return this.http.post<KinguinGiftCard>(this.baseUrl, { productId, price }, {
      withCredentials: true
    });
  }

  /**
   * Elimina un ítem de la lista de deseos.
   */
  removeWishItem(wishItemId: number | undefined): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${wishItemId}`, {
      withCredentials: true
    });
  }

  /**
   * Verifica si un ítem está en la lista de deseos.
   */
  isItemInWishList(kinguinId: number): Observable<boolean> {
    return this.getWishItems().pipe(
      map(wishItems => {
        return wishItems.some(item => parseInt(String(item.wishedItem.productId)) === kinguinId);
      })
    );
  }

  /**
   * Elimina todos los ítems de la lista de deseos.
   */
  removeAllWishItems(): Observable<any> {
    return this.http.delete(this.baseUrl, {
      withCredentials: true
    });
  }
}
