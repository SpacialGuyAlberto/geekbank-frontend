// src/app/cart.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from "../environments/environment";
import { AuthService } from './auth.service';
import { CartItemWithGiftcard } from "./models/CartItem";

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = environment.apiUrl;
  private baseUrl = `${this.apiUrl}/cart`;

  private cartItemCountSubject = new BehaviorSubject<number>(0);
  cartItemCount$ = this.cartItemCountSubject.asObservable();

  cartItemsSubject = new BehaviorSubject<CartItemWithGiftcard[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  private isLoadingCartItems = false; // Indicador para evitar múltiples cargas

  constructor(private http: HttpClient, private authService: AuthService) {
    this.loadCartItems();
  }

  /**
   * Carga los ítems del carrito desde el servidor o localStorage.
   */
  loadCartItems(): void {
    if (this.isLoadingCartItems) return; // Evita múltiples llamadas simultáneas
    this.isLoadingCartItems = true;

    if (this.authService.isAuthenticated()) {
      this.getCartItemsFromServer().subscribe({
        next: (items) => {
          this.cartItemsSubject.next(items);
          this.updateCartItemCount();
        },
        error: (err) => {
          console.error('Error loading cart items from server:', err);
          this.cartItemsSubject.next([]); // Asegura emitir un array vacío en caso de error
        },
        complete: () => {
          this.isLoadingCartItems = false; // Resetea el indicador
        }
      });
    } else {
      const items = this.getCartItemsFromLocalStorage();
      this.cartItemsSubject.next(items);
      this.updateCartItemCount();
      this.isLoadingCartItems = false; // Resetea el indicador
    }
  }

  /**
   * Obtiene los ítems del carrito desde el servidor.
   */
  private getCartItemsFromServer(): Observable<CartItemWithGiftcard[]> {
    return this.http.get<CartItemWithGiftcard[]>(this.baseUrl, {
      withCredentials: true // Enviar cookies con la solicitud
    });
  }

  /**
   * Obtiene los ítems del carrito desde localStorage con validación.
   */
  private getCartItemsFromLocalStorage(): CartItemWithGiftcard[] {
    const cart = localStorage.getItem('cart');
    try {
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error('Error parsing cart data from localStorage:', error);
      localStorage.removeItem('cart'); // Limpia localStorage si los datos no son válidos
      return [];
    }
  }

  /**
   * Guarda los ítems del carrito en localStorage.
   */
  private saveCartItemsToLocalStorage(items: CartItemWithGiftcard[]): void {
    localStorage.setItem('cart', JSON.stringify(items));
  }

  /**
   * Obtiene un Observable de los ítems del carrito.
   */
  getCartItems(): Observable<CartItemWithGiftcard[]> {
    return this.cartItems$;
  }

  /**
   * Agrega un ítem al carrito.
   */
  addCartItem(productId: number, quantity: number, price: number): Observable<void> {
    if (this.authService.isAuthenticated()) {
      return new Observable<void>(observer => {
        this.http.post<any>(this.baseUrl, { productId, quantity, price }, {
          withCredentials: true
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
      console.log("Probablemente no estás logueado, amigo.");
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
   * Actualiza la cantidad de un ítem en el carrito.
   */
  updateCartItem(productId: number, quantity: number): Observable<void> {
    if (this.authService.isAuthenticated()) {
      return new Observable<void>(observer => {
        this.http.put<void>(this.baseUrl, { productId, quantity }, {
          withCredentials: true
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

  /**
   * Elimina un ítem del carrito.
   */
  removeCartItem(productId: number): Observable<void> {
    if (this.authService.isAuthenticated()) {
      return new Observable<void>(observer => {
        this.http.delete(`${this.baseUrl}/${productId}`, {
          withCredentials: true
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
      let items = this.getCartItemsFromLocalStorage();
      items = items.filter(item => item.cartItem.productId !== productId);
      this.saveCartItemsToLocalStorage(items);
      this.cartItemsSubject.next(items);
      this.updateCartItemCount();
      return of();
    }
  }

  /**
   * Elimina todos los ítems del carrito.
   */
  removeAllCartItems(): Observable<void> {
    if (this.authService.isAuthenticated()) {
      return new Observable<void>(observer => {
        this.http.delete(this.baseUrl, {
          withCredentials: true
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
      localStorage.removeItem('cart');
      this.cartItemsSubject.next([]);
      this.updateCartItemCount();
      return of();
    }
  }

  /**
   * Actualiza el conteo de ítems en el carrito.
   */
  updateCartItemCount(): void {
    let items: CartItemWithGiftcard[];
    if (this.authService.isAuthenticated()) {
      items = this.cartItemsSubject.value;
    } else {
      items = this.getCartItemsFromLocalStorage();
    }
    const totalCount = items.reduce((total, item) => total + item.cartItem.quantity, 0);
    this.cartItemCountSubject.next(totalCount);
    sessionStorage.setItem('cartItemCount', JSON.stringify(totalCount));
  }

  /**
   * Actualiza manualmente el conteo de ítems en el carrito.
   */
  updateCartItemCountManual(count: number): void {
    this.cartItemCountSubject.next(count);
    sessionStorage.setItem('cartItemCount', JSON.stringify(count));
  }

  /**
   * Verifica si un ítem está en el carrito.
   */
  isItemInCart(kinguinId: number): Observable<boolean> {
    if (this.authService.isAuthenticated()) {
       console.log("IS ITEM IN CART BEING EXECUTTED");
      return this.getCartItemsFromServer().pipe(
        map(cartItems => {
          console.log("IS ITEM IN CART SERVICE: " + cartItems.some(item => parseInt(String(item.cartItem.productId)) === kinguinId ))
          return cartItems.some(item => parseInt(String(item.cartItem.productId)) === kinguinId);
        })
      );
    } else {
      const items = this.getCartItemsFromLocalStorage();
      return of(items.some(item => item.cartItem.productId === kinguinId));
    }
  }
}
