// src/app/services/main-screen-gift-card.service.ts

import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {KinguinGiftCard} from "../kinguin-gift-cards/KinguinGiftCard";
import { MainScreenGiftCardItem, MainScreenGiftCardItemDTO } from './MainScreenGiftCardItem';
import { environment } from '../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import {Page} from "../models/Page.model";
import {GiftcardClassification} from "./giftcard-classification.enum";


@Injectable({
  providedIn: 'root'
})
export class MainScreenGiftCardService {

  private apiUrl = environment.apiUrl;
  private baseUrl = `${this.apiUrl}/main-screen-gift-cards`; // URL base de tu API

  constructor(private http: HttpClient) { }

  getMainScreenGiftCardItems(page: number, size: number): Observable<Page<MainScreenGiftCardItemDTO[]>> {
    const url = `${this.baseUrl}?page=${page}&size=${size}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.get<Page<MainScreenGiftCardItemDTO[]>>(url, {
      headers,
      withCredentials: true
    });
  }

  /**
   * Agrega nuevos elementos de tarjetas de regalo para la pantalla principal.
   *
   * @param productIds Lista de IDs de productos a agregar
   * @returns Observable de una lista de MainScreenGiftCardItem
   */
  addMainScreenGiftCardItems(productIds: number[]): Observable<MainScreenGiftCardItem[]> {
    const requestBody = { productIds };
    return this.http.post<MainScreenGiftCardItem[]>(`${this.baseUrl}`, requestBody).pipe(
      tap((newItems: MainScreenGiftCardItem[]) => console.log(`Added ${newItems.length} main screen gift card items`)),
      catchError(this.handleError<MainScreenGiftCardItem[]>('addMainScreenGiftCardItems', []))
    );
  }

  addtoMainScreenGiftCards(giftcardItemDTO: MainScreenGiftCardItemDTO): Observable<MainScreenGiftCardItem> {
    return this.http.post<MainScreenGiftCardItem>(
      `${this.baseUrl}`,
      giftcardItemDTO,
      {
        withCredentials: true,
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      }
    ).pipe(
      tap((newItem: MainScreenGiftCardItem) => console.log(`Added ${newItem.productId} main screen gift card items`)),
      catchError(this.handleError<MainScreenGiftCardItem>('addtoMainScreenGiftCards'))
    );
  }


  getGiftcardsByClassification(classification: GiftcardClassification): Observable<MainScreenGiftCardItemDTO[]> {
    const params = new HttpParams().set('classification', classification);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.get<MainScreenGiftCardItemDTO[]>(this.baseUrl, {
      params,
      headers,
      withCredentials: true
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error al obtener giftcards por clasificación:', error);
        return throwError(() => new Error('No se pudieron cargar las tarjetas de regalo por clasificación.'));
      })
    );
  }


  /**
   * Elimina elementos de tarjetas de regalo para la pantalla principal basados en una lista de productIds.
   *
   * @param productIds Lista de IDs de productos a eliminar
   * @returns Observable de void
   */
  removeMainScreenGiftCardItems(productIds: number[]): Observable<void> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<void>(`${this.baseUrl}`, { headers, body: productIds }).pipe(
      tap(_ => console.log(`Removed main screen gift card items with product IDs: ${productIds}`)),
      catchError(this.handleError<void>('removeMainScreenGiftCardItems'))
    );
  }

  removeGiftCardItem(card: KinguinGiftCard): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${card.kinguinId}`, {
      withCredentials: true
    });
  }
  /**
   * Maneja los errores de las operaciones HTTP.
   *
   * @param operation Nombre de la operación que falló
   * @param result Resultado opcional a retornar en caso de error
   * @returns Función que retorna un Observable del resultado
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);

      return of(result as T);
    };
  }
}
