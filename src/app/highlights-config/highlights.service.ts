import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {KinguinGiftCard} from "../kinguin-gift-cards/KinguinGiftCard";
import {CartItemWithGiftcard} from "../cart/CartItem";
import {HighlightItemWithGiftcard} from "./HighlightItem";
import {environment} from "../../environments/environment";
import {catchError} from "rxjs/operators";
import {HighlightItem} from "./HighlightItem";

@Injectable({
  providedIn: 'root'
})
export class HighlightService {

  private apiUrl = environment.apiUrl
  private baseUrl = `${this.apiUrl}/highlights`;

  constructor(private http: HttpClient) { }

  getHighlights(): Observable<HighlightItemWithGiftcard[]> {
    return this.http.get<HighlightItemWithGiftcard[]>(`${this.baseUrl}`).pipe(
      catchError(error => {
        console.error('Error al obtener los highlights:', error);
        return of([]);
      })
    );
  }

  addHighlights( productIds: HighlightItem[] ): Observable<any> {
    const requestBody = { productIds };
    console.log(requestBody);
    return this.http.post(`${this.baseUrl}`, requestBody);
  }

  removeHighlights(productIds: number[]): Observable<void> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.delete<void>(`${this.baseUrl}`, {  body: productIds });
  }
}


