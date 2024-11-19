// order.service.ts
import { Injectable } from '@angular/core';
import {OrderRequest} from "./models/order-request.model";
import {environment} from "../environments/environment";
import {Observable} from "rxjs";
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = `${environment.apiUrl}/orders`;
  constructor(private http: HttpClient) {}

  // createOrderRequest(params: {
  //   userId: number | null;
  //   guestId: string | null;
  //   phoneNumber: string;
  //   cartItems: any[];
  //   totalPrice: number;
  //   productId: number | null;
  //   gameUserId: number | null;
  //   isManualTransaction: boolean;
  //   buyingBalance: boolean;
  // }): OrderRequest {
  //   const { userId, guestId, phoneNumber, cartItems, totalPrice, productId, gameUserId, isManualTransaction, buyingBalance } = params;
  //
  //   let products = [];
  //
  //   if (buyingBalance) {
  //     products.push({
  //       kinguinId: -1, // ID especial para balance
  //       qty: 1,
  //       price: totalPrice,
  //       name: 'Balance Purchase'
  //     });
  //   } else if (productId !== null) {
  //     products.push({
  //       kinguinId: productId,
  //       qty: 1,
  //       price: totalPrice,
  //       name: 'Product Purchase'
  //     });
  //   } else if (cartItems && cartItems.length > 0) {
  //     products = cartItems.map(item => ({
  //       kinguinId: item.cartItem.productId,
  //       qty: item.cartItem.quantity,
  //       price: item.giftcard.price,
  //       name: item.giftcard.name
  //     }));
  //   }
  //
  //   const amount = totalPrice;
  //
  //   const orderRequest: OrderRequest = {
  //     userId,
  //     guestId,
  //     phoneNumber,
  //     products, // Ahora esto es un array de `Product`
  //     amount,
  //     manual: isManualTransaction,
  //     gameUserId
  //   };
  //
  //
  //   return orderRequest;
  // }

  purchaseWithBalance(orderRequest: OrderRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/purchase-with-balance`, orderRequest);
  }
}
