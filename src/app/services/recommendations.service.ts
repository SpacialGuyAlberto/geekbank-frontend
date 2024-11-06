// src/app/services/recommendations.service.ts

import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {KinguinGiftCard} from "../models/KinguinGiftCard";
import {environment} from "../../environments/environment";
import {catchError} from "rxjs/operators"; // Ajusta la ruta si es necesario

@Injectable({
  providedIn: 'root'
})
export class RecommendationsService {


  private apiUrl = environment.apiUrl
  private baseUrl =  `${this.apiUrl}/recommendations`

  constructor(private http: HttpClient) { }

  getRecommendationsByUser(userId: number, k: number = 4): Observable<KinguinGiftCard[]> {
    const url = `${this.baseUrl}/user/${userId}?k=${k}`;
    console.log(`Fetching recommendations from: ${url}`);
    return this.http.get<KinguinGiftCard[]>(url, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      })
    }).pipe(
      catchError(error => {
        console.error('Error fetching recommendations', error);
        return of([]);
      })
    );
  }

  getMostPopular(k: number = 4): Observable<KinguinGiftCard[]> {
    const url = `${this.baseUrl}/popular?k=${k}`;
    console.log(`Fetching recommendations from: ${url}`);
    return this.http.get<KinguinGiftCard[]>(url, {
    }).pipe(
      catchError(error => {
        console.error('Error fetching recommendations', error);
        return of([]);
      })
    );
  }

  getContentBasedRecommendations(kinguinId: number, limit: number = 20): Observable<KinguinGiftCard[]> {
    const url = `${this.baseUrl}/content-based/${kinguinId}?limit=${limit}`;
    console.log(`Fetching content-based recommendations from: ${url}`);
    return this.http.get<KinguinGiftCard[]>(url).pipe( // Eliminado el bloque de headers
      catchError(error => {
        console.error('Error fetching content-based recommendations', error);
        return of([]);
      })
    );
  }
}
