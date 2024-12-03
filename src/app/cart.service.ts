// src/app/cart.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { KinguinGiftCard } from './models/KinguinGiftCard';
import { CartItemWithGiftcard } from "./models/CartItem";
import { environment } from "../environments/environment";
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = environment.apiUrl;
  private baseUrl = `${this.apiUrl}/cart`;

  private cartItemCountSubject = new BehaviorSubject<number>(0);
  cartItemCount$: Observable<number> = this.cartItemCountSubject.asObservable();

  private cartItemsSubject = new BehaviorSubject<CartItemWithGiftcard[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.loadCartItems();
  }

  /**
   * Carga los elementos del carrito desde el servidor o localStorage dependiendo del estado de autenticación.
   */
 loadCartItems(): void {
    if (this.authService.isAuthenticated()) {
      this.getCartItemsFromServer().subscribe(items => {
        this.cartItemsSubject.next(items);
        this.updateCartItemCount();
      });
    } else {
      const items = this.getCartItemsFromLocalStorage();
      this.cartItemsSubject.next(items);
      this.updateCartItemCount();
    }
  }


  private getCartItemsFromServer(): Observable<CartItemWithGiftcard[]> {
    return this.http.get<CartItemWithGiftcard[]>(this.baseUrl, {
      withCredentials: true // Incluir cookies automáticamente en la solicitud
    });
  }

  private getCartItemsFromLocalStorage(): CartItemWithGiftcard[] {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  }

  private saveCartItemsToLocalStorage(items: CartItemWithGiftcard[]): void {
    localStorage.setItem('cart', JSON.stringify(items));
  }

  getCartItems(): Observable<CartItemWithGiftcard[]> {
    return this.cartItems$;
  }

  /**
   * Agrega un elemento al carrito.
   */
  addCartItem(productId: number, quantity: number, price: number): Observable<void> {
    if (this.authService.isAuthenticated()) {
      return new Observable<void>(observer => {
        this.http.post<KinguinGiftCard>(this.baseUrl, { productId, quantity, price }, {
          withCredentials: true // Asegura que las cookies se incluyan en la solicitud
        }).subscribe({
          next: () => {
            this.loadCartItems();
            observer.next();
            observer.complete();
          },
          error: (err) => {
            observer.error(err);
          }
        });
      });
    } else {
      console.log("You are probably not logged in my friend");
      const items = this.getCartItemsFromLocalStorage();
      const existingItem = items.find(item => item.cartItem.productId === productId);
      if (existingItem) {
        existingItem.cartItem.quantity += quantity;
      } else {
        items.push({ cartItem: { productId, quantity }, giftcard: { price } } as CartItemWithGiftcard);
      }
      this.saveCartItemsToLocalStorage(items);
      this.cartItemsSubject.next(items);
      this.updateCartItemCount();
      return of();
    }
  }


  /**
   * Actualiza un elemento del carrito.
   */
  updateCartItem(productId: number, quantity: number): Observable<void> {
    if (this.authService.isLoggedIn()) {
      // Actualizar en el carrito del servidor
      return new Observable<void>(observer => {
        this.http.put<KinguinGiftCard>(this.baseUrl, { productId, quantity }, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          })
        }).subscribe({
          next: () => {
            this.loadCartItems();
            observer.next();
            observer.complete();
          },
          error: (err) => {
            observer.error(err);
          }
        });
      });
    } else {
      const items = this.getCartItemsFromLocalStorage();
      const item = items.find(item => item.cartItem.productId === productId);
      if (item) {
        item.cartItem.quantity = quantity;
        this.saveCartItemsToLocalStorage(items);
        this.cartItemsSubject.next(items);
        this.updateCartItemCount();
      }
      return of();
    }
  }

  removeCartItem(productId: number): Observable<void> {
    if (this.authService.isAuthenticated()) {
      // Remover del carrito en el servidor
      return new Observable<void>(observer => {
        this.http.delete(`${this.baseUrl}/${productId}`, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          })
        }).subscribe({
          next: () => {
            this.loadCartItems();
            observer.next();
            observer.complete();
          },
          error: (err) => {
            observer.error(err);
          }
        });
      });
    } else {
      // Remover del carrito en localStorage
      let items = this.getCartItemsFromLocalStorage();
      items = items.filter(item => item.cartItem.productId !== productId);
      this.saveCartItemsToLocalStorage(items);
      this.cartItemsSubject.next(items);
      this.updateCartItemCount();
      return of();
    }
  }

  isItemInCart(kinguinId: number): Observable<boolean> {
    if (this.authService.isLoggedIn()) {
      return this.getCartItemsFromServer().pipe(
        map(cartItems => {
          return cartItems.some(item => parseInt(String(item.cartItem.productId)) === kinguinId);
        })
      );
    } else {
      const items = this.getCartItemsFromLocalStorage();
      return of(items.some(item => item.cartItem.productId === kinguinId));
    }
  }

  removeAllCartItems(): Observable<void> {
    if (this.authService.isLoggedIn()) {
      // Remover todos los elementos del carrito en el servidor
      return new Observable<void>(observer => {
        this.http.delete(this.baseUrl, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          })
        }).subscribe({
          next: () => {
            this.cartItemsSubject.next([]);
            this.updateCartItemCount();
            observer.next();
            observer.complete();
          },
          error: (err) => {
            observer.error(err);
          }
        });
      });
    } else {
      // Remover todos los elementos del carrito en localStorage
      localStorage.removeItem('cart');
      this.cartItemsSubject.next([]);
      this.updateCartItemCount();
      return of();
    }
  }

  updateCartItemCount(): void {
    let items: CartItemWithGiftcard[];
    if (this.authService.isLoggedIn()) {
      items = this.cartItemsSubject.value;
    } else {
      items = this.getCartItemsFromLocalStorage();
    }
    const totalCount = items.reduce((total, item) => total + item.cartItem.quantity, 0);
    this.cartItemCountSubject.next(totalCount);
    sessionStorage.setItem('cartItemCount', JSON.stringify(totalCount));
  }

  updateCartItemCountManual(count: number): void {
    this.cartItemCountSubject.next(count);
    sessionStorage.setItem('cartItemCount', JSON.stringify(count));
  }
}
