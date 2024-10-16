import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import {HighlightItemWithGiftcard} from "./models/HighlightItem";
import {environment} from "../environments/environment";
import {Transaction} from "./models/transaction.model";

// export interface Transaction {
//   id: number;
//   amount: number;
//   transactionNumber: string;
//   description: string;
//   status: string;
//   timestamp: string;
//   type: string;
//   phoneNumber: string;
// }

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private apiUrl = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}`);
  }

  getTransactionsById(userId: number | undefined): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/${userId}`);
  }

  getTransactionsByUserIdAndTimestamp(userId: number, start: string, end: string): Observable<Transaction[]> {
    let params = new HttpParams()
      .set('userId', userId.toString())
      .set('start', start)
      .set('end', end);
    return this.http.get<Transaction[]>(`${this.apiUrl}/filter`, { params });
  }

}
