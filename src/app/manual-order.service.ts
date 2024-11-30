// src/app/services/manual-orders.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {environment} from "../environments/environment";
import {Transaction} from "./models/transaction.model";

@Injectable({
  providedIn: 'root'
})
export class ManualOrdersService {

  private apiUrl = `${environment.apiUrl}/manual-orders`; // Ajusta el puerto según tu configuración

  constructor(private http: HttpClient) { }

  runManualOrder(transactionNumber: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/run/${transactionNumber}`, {})
      .pipe(
        catchError(this.handleError)
      );
  }


  private handleError(error: HttpErrorResponse) {
    let errorMsg = '';
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMsg = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMsg = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMsg);
  }
}
