import { Injectable } from '@angular/core';
import {AbstractControl} from "@angular/forms";
import {Observable, tap} from "rxjs";
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import {Transaction} from "./transactions.service";
import {User} from "./models/User";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:7070/api/users';

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
