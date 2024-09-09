import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { firstValueFrom, Observable, tap } from 'rxjs';
import { Router } from "@angular/router";
import { User } from "./models/User";
import {AbstractControl, ɵFormGroupRawValue, ɵGetProperty, ɵTypedOrUntyped} from "@angular/forms";

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:7070/api/auth';
  private baseUrl2 = 'http://localhost:7070/api/users';
  private token: string | undefined;
  private emailUser: string | undefined;

  constructor(private http: HttpClient, private router: Router) {}

  register(email: string, password: string, name: string): Observable<HttpResponse<any>> {
    return this.http.post(
      `${this.baseUrl}/registerUser`,
      { email, password, name },
      { observe: 'response', responseType: 'text' as 'json' }
    );
  }

  activateUser(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/activate?token=${token}`);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { email, password }, { observe: 'response' }).pipe(
      tap(response => {
        const token = response.headers.get('Authorization');
        if (token) {
          this.setToken(token);
        }
      })
    );
  }

  validatePassword( password: string): Observable<HttpResponse<any>> {
    const email = sessionStorage.getItem("email");
    return this.http.post(`${this.baseUrl}/validate-password`, { email, password }, { observe: 'response' }).pipe(
      tap(response => {
        const token = response.headers.get('Authorization');
        if (token) {
          this.setToken(token);
        }
      })
    );
  }

  resetPassword(oldPassword: AbstractControl | null, newPassword: AbstractControl | null): Observable<any> {
    const email = sessionStorage.getItem("email");

    return this.http.post(`${this.baseUrl}/reset-password`,
      {
        email,
        oldPassword: oldPassword?.value,
        newPassword: newPassword?.value
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

  isLoggedIn(): boolean {
    return this.isBrowser() && !!localStorage.getItem('token');
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

  getToken(): string {
    return this.isBrowser() ? localStorage.getItem('token') || '' : '';
  }

  logout(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    return this.http.post(`${this.baseUrl}/logout`, {}, { headers, responseType: 'text' });
  }

  async performLogout(router: Router): Promise<void> {
    try {
      await firstValueFrom(this.logout());
      console.log('Logout successful');
      if (this.isBrowser()) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
      }
      this.setToken('');
      await router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error', error);
    }
  }

  isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  loadGoogleScript(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.isBrowser()) {
        const existingScript = document.getElementById('google-jssdk');
        if (existingScript) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.id = 'google-jssdk';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          resolve();
        };
        script.onerror = (error) => {
          reject(error);
        };
        document.head.appendChild(script);
      } else {
        resolve();
      }
    });
  }

  initializeGoogleSignIn(): void {
    if (this.isBrowser() && typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '445500636748-2nuqarr3morlrul9bdadefcogo7rffcn.apps.googleusercontent.com',
        callback: (response: any) => this.handleGoogleLogin(response)
      });
      google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          type: 'icon',  // Solo el ícono
          shape: 'circle'  // Forma circular del ícono
        }
      );
    } else {
      console.error('Google script not loaded or not in a browser environment');
    }
  }


  handleGoogleLogin(response: any) {
    const token = response.credential;
    this.googleLogin(token).subscribe(
      (data: any) => {
        localStorage.setItem('token', data.token);
        this.router.navigate(['/home']).then(() => {
          window.location.reload();  // Recargar la página después de la navegación
        });
      },
      (error) => {
        console.error('Google login error', error);
      }
    );
  }

  googleLogin(token: string): Observable<any> {
    return this.http.post<{ token: string }>(`${this.baseUrl}/google-login`, { token });
  }

  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl2}/${userId}`);
  }

  getUserDetails(): Observable<User> {
    const userId = this.getUserId();
    return this.http.get<User>(`${this.baseUrl2}/user-details`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.getToken()}`
      })
    });
  }

  setSession(authResult: any) {
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('userId', authResult.userId);
    localStorage.setItem('email', authResult.email);
  }


  getUserId(): string {
    return localStorage.getItem('userId') || '';
  }
}
