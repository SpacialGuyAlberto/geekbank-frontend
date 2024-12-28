// src/app/services/sales-metrics.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {SalesMetrics} from "./models/salesMetrics.model";
import {Transaction} from "./models/transaction.model";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class SalesMetricsService {

  private apiUrl = `${environment.apiUrl}/metrics`; // Cambia esto según tu configuración

  constructor(private http: HttpClient) { }

  getCurrentMetrics(): Observable<SalesMetrics> {
    return this.http.get<SalesMetrics>(`${this.apiUrl}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  recordTransaction(transaction: Transaction): Observable<string> {
    return this.http.post(`${this.apiUrl}/transaction`, transaction, { responseType: 'text' })
      .pipe(
        catchError(this.handleError)
      );
  }

  resetMetrics(): Observable<string> {
    return this.http.post(`${this.apiUrl}/reset`, {}, { responseType: 'text' })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error ${error.status}: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
