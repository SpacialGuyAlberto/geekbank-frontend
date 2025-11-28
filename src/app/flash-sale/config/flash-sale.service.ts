import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {FlashSale} from "./FlashSale";
import {environment} from "../../../environments/environment";
import {catchError} from "rxjs/operators";


@Injectable({ providedIn: 'root' })
export class FlashSaleService {
  private apiUrl = environment.apiUrl
  private baseUrl = `${this.apiUrl}/flash-offers`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<FlashSale[]> {
    return this.http.get<FlashSale[]>(`${this.baseUrl}`).pipe(
      catchError(error => {
        console.error('Error al obtener los Flash Offers', error);
        return of([]);
      })
    );
  }

  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
