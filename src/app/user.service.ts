import { Injectable } from '@angular/core';
import {AbstractControl} from "@angular/forms";
import {BehaviorSubject, Observable, tap} from "rxjs";
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import {Transaction} from "./transactions.service";
import {User} from "./models/User";
import {environment} from "../environments/environment";
import {KinguinGiftCard} from "./models/KinguinGiftCard";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/users`;
  private usersSubject: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);


  constructor(private http: HttpClient) { }

  updateDetails(password: string, email: string, phoneNumber: string, name: string): Observable<any> {
    // const email = sessionStorage.getItem("email");

    return this.http.post(`${this.baseUrl}/update-user-details`,
      {
        name,
        email,
        password,
        phoneNumber
      },
      { observe: 'response' }
    ).pipe(
      tap(response => {
        const token = response.headers.get('Authorization');
        if (token) {
          this.setToken(token);
        }
      })
    );
  }

  setPassword(token: string, password: string) {
    const url = `${this.baseUrl}/setPassword`;
    const body = { token, password };
    return this.http.post(url, body, { observe: 'response' });
  }

  setToken(token: string): void {
    if (this.isBrowser()) {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}`);
  }

}



// getTransactions(): Observable<Transaction[]> {
//   return this.http.get<Transaction[]>(`${this.apiUrl}`);
// }
