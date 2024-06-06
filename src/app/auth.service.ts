import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {firstValueFrom, Observable} from 'rxjs';
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:7070/api/auth';
  private token: string | undefined;

  constructor(private http: HttpClient) { }

  register(email: string, password: string, name: string): Observable<HttpResponse<any>> {
    return this.http.post(
      `${this.baseUrl}/registerUser`,
      { email, password, name },
      { observe: 'response', responseType: 'text' as 'json' }
    );
  }

  login(email: string, password: string): Observable<HttpResponse<any>> {
    return this.http.post(
      `${this.baseUrl}/login`,
      { email, password },
      { observe: 'response', responseType: 'text' as 'json' }
    );
  }

  isLoggedIn(): boolean {
    return typeof localStorage !== 'undefined' && !!localStorage.getItem('token');
  }

  setToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  getToken(): string {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('token') || '' : '';
  }

  logout(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
    return this.http.post(`${this.baseUrl}/logout`, {}, { headers, responseType: 'text' });
  }

  async performLogout(router: Router): Promise<void> {
    try {
      await firstValueFrom(this.logout());
      console.log('Logout successful');
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
      }
      this.setToken('');
      router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error', error);
    }
  }
}
