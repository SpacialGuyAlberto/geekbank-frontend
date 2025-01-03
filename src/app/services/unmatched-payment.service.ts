// src/app/services/unmatched-payment.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {environment} from "../../environments/environment";
// Define la interfaz del UnmatchedPayment
export interface UnmatchedPayment {
  id?: number;
  phoneNumber: string;
  amountReceived: number;
  referenceNumber: string;
  receivedAt: string; // Usaremos string para manejar fechas en Angular
  consumed: boolean;
  differenceRedeemed: boolean;
  verified: boolean;
  smsMessage?: any; // Ajusta según la estructura de SmsMessage
  createdBy?: string;
  updatedBy?: string;
  imageBase64?: string | null; // Ahora es una cadena Base64
}

@Injectable({
  providedIn: 'root'
})
export class UnmatchedPaymentService {

  private baseUrl = `${environment.apiUrl}/admin/payments`

  constructor(private http: HttpClient) { }

  // Obtener todos los pagos no coincidentes
  getAllPayments(): Observable<UnmatchedPayment[]> {
    return this.http.get<UnmatchedPayment[]>(this.baseUrl)
      .pipe(catchError(this.handleError));
  }

  // Obtener un pago por ID
  getPaymentById(id: number): Observable<UnmatchedPayment> {
    return this.http.get<UnmatchedPayment>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Crear un nuevo pago
  createPayment(payment: UnmatchedPayment): Observable<UnmatchedPayment> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<UnmatchedPayment>(this.baseUrl, payment, { headers })
      .pipe(catchError(this.handleError));
  }

  // Actualizar un pago existente
  updatePayment(id: number, payment: UnmatchedPayment): Observable<UnmatchedPayment> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<UnmatchedPayment>(`${this.baseUrl}/${id}`, payment, { headers })
      .pipe(catchError(this.handleError));
  }

  // Eliminar un pago
  deletePayment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Manejo de errores
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido!';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Error Code: ${error.status}\nMensaje: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
