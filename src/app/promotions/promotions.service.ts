import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { environment } from "../../environments/environment";
import { Transaction } from "../transactions/transaction.model";
import { catchError } from "rxjs/operators";
import {ManualVerificationTransactionDto} from "../transactions/TransactionProductDto.model";
import {OrderDetails} from "../models/order-details.model";
import {VerifyPaymentRequest} from "../models/verify-payment-request.model";
import {OrderRequest} from "../models/order-request.model";
import {UnmatchedPaymentResponseDto} from "../models/unmatched-payment-response.model";

@Injectable({
  providedIn: 'root'
})
export class PromotionsService {
  private apiUrl = `${environment.apiUrl}/promotion`;

  private transactionNumberSubject = new BehaviorSubject<string | null>(null);
  constructor(private http: HttpClient) {  }

  public promotionCodeExist(code: string) : Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/checkIfCodeExists/${code}`)
  }

}
