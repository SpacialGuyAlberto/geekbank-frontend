// src/app/services/kinguin.service.ts
import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { KinguinGiftCard } from './models/KinguinGiftCard';
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class KinguinService {
  private apiUrl = `${environment.apiUrl}/kinguin/gift-cards`;

  constructor(private http: HttpClient) {}

  getKinguinGiftCards(page: number): Observable<KinguinGiftCard[]> {
    const headers = new HttpHeaders().set('X-Api-Key', '77d96c852356b1c654a80f424d67048f');
    return this.http.get<KinguinGiftCard[]>(`${this.apiUrl}?page=${page}`, { headers });
  }

  getGiftCardDetails(id: string): Observable<KinguinGiftCard> {
    const headers = new HttpHeaders().set('X-Api-Key', '77d96c852356b1c654a80f424d67048f');
    return this.http.get<KinguinGiftCard>(`${this.apiUrl}/${id}`, { headers });
  }

  searchGiftCards(name: string): Observable<KinguinGiftCard[]> {
    const headers = new HttpHeaders().set('X-Api-Key', '77d96c852356b1c654a80f424d67048f');
    return this.http.get<KinguinGiftCard[]>(`${this.apiUrl}/search?name=${name}`, { headers });
  }

  getFilteredGiftCards(filters: any): Observable<KinguinGiftCard[]> {
    const headers = new HttpHeaders().set('X-Api-Key', '77d96c852356b1c654a80f424d67048f');
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params = params.append(key, filters[key]);
      }
    });

    return this.http.get<KinguinGiftCard[]>(`${this.apiUrl}/filter`, { headers, params });
  }

}
