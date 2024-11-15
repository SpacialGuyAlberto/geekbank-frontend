import { Injectable } from '@angular/core';
import {environment} from "../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Account} from "./models/User";

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = environment.apiUrl
  private baseUrl = `${this.apiUrl}/accounts`
  constructor(private http: HttpClient)
  { }

  applyBalance(id: number, amount: number): Observable<Account> {
    const url = `${this.baseUrl}/apply-balance/${id}`;
    const params = new HttpParams().set('amount', amount);

    return this.http.post<Account>(url, null, { params });
  }
}
