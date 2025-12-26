import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { FlashSale } from "./models/FlashSale";
import { environment } from "../../../environments/environment";
import { catchError } from "rxjs/operators";
import {FlashOfferProduct, FlashOfferProductWithGiftCard} from "./models/FlashOfferProduct";


@Injectable({ providedIn: 'root' })
export class FlashSaleService {
  private apiUrl = environment.apiUrl
  private baseUrl = `${this.apiUrl}/flash-offers`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<FlashSale[]> {
    return this.http.get<FlashSale[]>(`${this.baseUrl}`).pipe(
      catchError(error => {
        console.error('Error al obtener los Flash Offers', error);
        return of([]);
      })
    );
  }

  getFlashOffersProducts(): Observable<FlashOfferProduct[]> {
    return this.http.get<FlashOfferProduct[]>(`${this.baseUrl}/products`).pipe(
      catchError(err => {
        console.error("Error al obtener los id de los productos", err);
        return of([]);
      })
    );

  }

  create(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
