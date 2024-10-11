// src/app/services/payout.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CreatePayoutRequest, CreatePayoutResponse } from '../models/payment.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PayoutService {

  private baseUrl = `${environment.apiUrl}/payouts`;

  constructor(private http: HttpClient) { }

  /**
   * Crear un payout para un empleado.
   * @param request Objeto con los detalles del payout.
   * @returns Observable de CreatePayoutResponse.
   */
  createPayout(request: CreatePayoutRequest): Observable<CreatePayoutResponse> {
    return this.http.post<CreatePayoutResponse>(`${this.baseUrl}/create`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Manejo de errores HTTP.
   * @param error Objeto de error HTTP.
   * @returns Observable con mensaje de error.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido!';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
