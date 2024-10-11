// src/app/services/payment.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CreatePaymentResponse, CapturePaymentResponse } from '../models/payment.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private baseUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) { }

  /**
   * Crear un pago para un cliente.
   * @param total Monto del pago.
   * @param currency Código de la moneda (e.g., USD, EUR).
   * @param returnUrl URL a la que se redirige al aprobar el pago.
   * @param cancelUrl URL a la que se redirige al cancelar el pago.
   * @returns Observable de CreatePaymentResponse.
   */
  createPayment(total: string, currency: string, returnUrl: string, cancelUrl: string): Observable<CreatePaymentResponse> {
    const payload = { total, currency, returnUrl, cancelUrl };
    return this.http.post<CreatePaymentResponse>(`${this.baseUrl}/create`, payload)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Capturar un pago después de su aprobación.
   * @param orderId ID de la orden de pago.
   * @returns Observable de CapturePaymentResponse.
   */
  capturePayment(orderId: string): Observable<CapturePaymentResponse> {
    return this.http.post<CapturePaymentResponse>(`${this.baseUrl}/capture/${orderId}`, {})
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
