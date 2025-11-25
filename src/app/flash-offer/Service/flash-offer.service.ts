import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FlashOffer {
  id?: number;
  productId: number;
  createdAt?: string;
  limitDate: string;
  temporaryPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class FlashOfferService {

  private baseUrl = '/api/flash-offers';

  constructor(private http: HttpClient) {}
  getAll(): Observable<FlashOffer[]> {
    return this.http.get<FlashOffer[]>(this.baseUrl);
  }
  getById(id: number): Observable<FlashOffer> {
    return this.http.get<FlashOffer>(`${this.baseUrl}/${id}`);
  }
  getByProductId(productId: number): Observable<FlashOffer> {
    return this.http.get<FlashOffer>(`${this.baseUrl}/product/${productId}`);
  }

  getActive(): Observable<FlashOffer[]> {
    return this.http.get<FlashOffer[]>(`${this.baseUrl}/active`);
  }
  create(offer: FlashOffer): Observable<FlashOffer> {
    return this.http.post<FlashOffer>(this.baseUrl, offer);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
  deleteExpired(): Observable<string> {
    return this.http.delete(`${this.baseUrl}/expired`, { responseType: 'text' });
  }
}
