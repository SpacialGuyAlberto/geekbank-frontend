import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {HighlightItemWithGiftcard} from "./models/HighlightItem";


export interface Transaction {
  id: number;
  amount: number;
  transactionNumber: string;
  description: string;
  status: string;
  timestamp: string;
  type: string;
  phoneNumber: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private apiUrl = 'http://localhost:7070/api/transactions';

  constructor(private http: HttpClient) {}

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}`);
  }

  getTransactionsById(userId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/${userId}`);
  }

}
