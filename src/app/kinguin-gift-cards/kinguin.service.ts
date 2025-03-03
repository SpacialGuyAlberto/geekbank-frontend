// src/app/services/kinguin.service.ts
import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import { KinguinGiftCard } from './KinguinGiftCard';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class KinguinService {
  private apiUrl = `${environment.apiUrl}/kinguin/gift-cards`;
  private giftCardsSubject: BehaviorSubject<KinguinGiftCard[]> = new BehaviorSubject<KinguinGiftCard[]>([]);

  constructor(private http: HttpClient) {}

  getGiftCardsModel(): Observable<KinguinGiftCard[]> {
    return this.giftCardsSubject.asObservable();
  }

  private updateGiftCardsModel(giftCard: KinguinGiftCard[]): void {
    this.giftCardsSubject.next(giftCard);
  }
  getKinguinGiftCards(page: number): Observable<KinguinGiftCard[]> {
    const headers = new HttpHeaders().set('X-Api-Key', '77d96c852356b1c654a80f424d67048f');
    return this.http.get<KinguinGiftCard[]>(`${this.apiUrl}?page=${page}`, { headers })
      .pipe(
        tap((giftCards: KinguinGiftCard[]) => this.updateGiftCardsModel(giftCards))
      );
  }

  getGiftCardDetails(id: string): Observable<KinguinGiftCard> {
    const headers = new HttpHeaders().set('X-Api-Key', '77d96c852356b1c654a80f424d67048f');
    return this.http.get<KinguinGiftCard>(`${this.apiUrl}/${id}`, { headers });
  }

  searchGiftCards(name: string): Observable<KinguinGiftCard[]> {
    const headers = new HttpHeaders().set('X-Api-Key', '77d96c852356b1c654a80f424d67048f');
    return this.http.get<KinguinGiftCard[]>(`${this.apiUrl}/search?name=${name}`, { headers })
      .pipe(
        tap((giftCards: KinguinGiftCard[]) => this.updateGiftCardsModel(giftCards))
      );
  }

  getFilteredGiftCards(filters: any): Observable<KinguinGiftCard[]> {
    const headers = new HttpHeaders().set('X-Api-Key', '77d96c852356b1c654a80f424d67048f');
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params = params.append(key, filters[key]);
      }
    });

    // Log para verificar los parámetros
    console.log('Parameters being sent:', params.toString());

    return this.http.get<KinguinGiftCard[]>(`${this.apiUrl}/filter`, { headers, params });
  }

  getGiftCardsByCategory(category: string): Observable<KinguinGiftCard[]> {
    const headers = new HttpHeaders().set('X-Api-Key', '77d96c852356b1c654a80f424d67048f');
    const params = new HttpParams().set('genre', category);

    return this.http.get<KinguinGiftCard[]>(`${this.apiUrl}/filter`, { headers, params }).pipe(
      tap((giftCards: KinguinGiftCard[]) => {
        this.updateGiftCardsModel(giftCards);
      })
    );
  }



}
