// transactions.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { environment } from "../environments/environment";
import { Transaction } from "./models/transaction.model";
import { catchError } from "rxjs/operators";
import {ManualVerificationTransactionDto} from "./models/TransactionProductDto.model";
import {OrderDetails} from "./models/order-details.model";
import {VerifyPaymentRequest} from "./models/verify-payment-request.model";
import {OrderRequest} from "./models/order-request.model";
import {UnmatchedPaymentResponseDto} from "./models/unmatched-payment-response.model";

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private apiUrl = `${environment.apiUrl}/transactions`;

  private transactionNumberSubject = new BehaviorSubject<string | null>(null);
  transactionNumber$ = this.transactionNumberSubject.asObservable();
  private pendingTransactionsSubject = new BehaviorSubject<Transaction[]>([]);
  private pendingForApprovalTransactionSubject = new BehaviorSubject<ManualVerificationTransactionDto[]>([])

  constructor(private http: HttpClient) {}

  setTransactionNumber(transactionNumber: string): void {
    this.transactionNumberSubject.next(transactionNumber);
  }

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getTransactionsById(userId: number | undefined): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/${userId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getTransactionByNumber(transactionNumber: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/by-number/${transactionNumber}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getTransactionsByUserIdAndTimestamp(userId: number, start: string, end: string): Observable<Transaction[]> {
    let params = new HttpParams()
      .set('userId', userId.toString())
      .set('start', start)
      .set('end', end);
    return this.http.get<Transaction[]>(`${this.apiUrl}/filter`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  cancelTransaction(transactionId: string | null, orderRequestId: string): Observable<Transaction> {
    const url = `${this.apiUrl}/cancel/${transactionId}/${orderRequestId}`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // Agrega otros encabezados si es necesario, como autenticación
      // 'Authorization': `Bearer ${token}`
    });

    return this.http.put<Transaction>(url, null, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  verifyTransaction(phoneNumber: string, pin: string, refNumber: string): Observable<any> {
    const payload = {
      phoneNumber: phoneNumber,
      pin: pin,
      refNumber: refNumber
    };
    return this.http.post<any>(`${this.apiUrl}/verify`, payload, {
      observe: 'response',
      responseType: 'text' as 'json'
    }).pipe(
      catchError(this.handleError)
    );
  }


  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('Ocurrió un error:', error.error.message);
    } else {
      console.error(
        `Backend retornó el código ${error.status}, ` +
        `mensaje de error: ${error.message}`);
    }
    return throwError('Algo malo sucedió; por favor, intenta de nuevo más tarde.');
  }

  getPendingTransactions(): Observable<Transaction[]> {
    this.http.get<Transaction[]>(`${this.apiUrl}/manual-pending`).subscribe(
      (transactions) => this.pendingTransactionsSubject.next(transactions),
      (error) => console.error('Error al obtener transacciones pendientes:', error)
    );
    return this.pendingTransactionsSubject.asObservable();
  }

  getWaitingForApprovalTransactions(): Observable<ManualVerificationTransactionDto[]> {
    this.http.get<ManualVerificationTransactionDto[]>(`${this.apiUrl}/awaiting-approval`).subscribe(
      (transactions) => this.pendingForApprovalTransactionSubject.next(transactions),
      (error) => console.error("Error al obtener las transacciones pendientes", error)
    );
    return this.pendingForApprovalTransactionSubject.asObservable();
  }

  verifyUnmatchedPaymentAmount(referenceNumber: string, expectedAmount: number): Observable<UnmatchedPaymentResponseDto> {
    const url = `${this.apiUrl}/verify-unmatched-payment`;
    const params = { referenceNumber,  expectedAmount: expectedAmount.toString() };

    return this.http.get<UnmatchedPaymentResponseDto>(url, { params }).pipe(
      catchError(this.handleError)
    );
  }
}
