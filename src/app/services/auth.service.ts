import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import {BehaviorSubject, firstValueFrom, Observable, of, tap} from 'rxjs';
import { Router } from "@angular/router";
import { User } from "../user-details/User";
import {AbstractControl, ɵFormGroupRawValue, ɵGetProperty, ɵTypedOrUntyped} from "@angular/forms";
import {environment} from "../../environments/environment";
import {Store} from "@ngrx/store";
import {AppState} from "../app.state";
import {CookieService} from "ngx-cookie-service";
import { catchError, map } from 'rxjs/operators';


declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authenticated = false;
  private userId: string | null = null;

  private apiUrl = environment.apiUrl
  private baseUrl =  `${this.apiUrl}/auth`;
  private baseUrl2 = `${this.apiUrl}/users`;
  private token: string | undefined;
  private emailUser: string | undefined;
  private loggedIn = new BehaviorSubject<boolean>(false);
  loggedIn$ = this.loggedIn.asObservable();

  constructor(
    private cookieService: CookieService,
    private http: HttpClient,
    private router: Router,
    private store: Store<AppState>
  ) {
    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');
    this.userId = userId;
    this.loggedIn.next(!!token);
  }

  register(email: string, password: string, name: string): Observable<HttpResponse<any>> {
    return this.http.post(
      `${this.baseUrl}/registerUser`,
      { email, password, name },
      { observe: 'response', responseType: 'text' as 'json' }
    );
  }

  registerClientAsAdmin(email: string,  name: string): Observable<any> {
    const url = `${this.apiUrl}/auth/registerUserByAdmin`; // Asegúrate de que este endpoint exista en tu backend
    const body = { email, name };
    return this.http.post(url, body, { observe: 'response' , responseType: 'text' as 'json' });
  }

  activateUser(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/activate?token=${token}`, { observe: 'response' , responseType: 'text' as 'json' });
  }

  login(email: string, password: string): Observable<{ userId: string }> {
    return this.http.post<{ userId: string }>(
      `${this.baseUrl}/login`,
      { email, password },
      { withCredentials: true }
    ).pipe(
      tap(response => {
        this.authenticated = true;
        this.userId = response.userId;
        this.loggedIn.next(true);
        sessionStorage.setItem('userId', this.userId);
        localStorage.setItem('userId', this.userId);
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
    return this.cookieService.check('jwtToken');
  }

  setToken(token: string): void {
    if (this.isBrowser()) {
      if (token) {
        sessionStorage.setItem('token', token);
        this.loggedIn.next(true); // Update logged-in status
      } else {
        sessionStorage.removeItem('token');
        this.loggedIn.next(false);
      }
    }
  }

  getToken(): string {
    return this.isBrowser() ? sessionStorage.getItem('token') || '' : '';
  }

  logout(): void {
    this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        // Eliminar todas las cookies y almacenamiento
        this.cookieService.delete('jwtToken', '/');
        this.loggedIn.next(false);
        this.authenticated = false;
        sessionStorage.clear();
        localStorage.clear();
        if (this.isBrowser()) {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('userId');
          localStorage.removeItem('userId');
        }
        // Forzar una recarga completa de la página y redirigir a /login
        window.location.href = '/login';
      },
      error: (error) => {
        console.error('Error during logout:', error);
        // Opcional: Mostrar una notificación de error al usuario
      }
    });
  }

  isAuthenticated(): boolean {
    return this.authenticated;
  }

  checkAuthentication(): Observable<boolean> {
    if (this.authenticated) {
      return of(true);
    } else {
      return this.http.get<{ authenticated: boolean }>(
        `${this.baseUrl}/check-auth`,
        { withCredentials: true }
      ).pipe(
        map(response => {
          this.authenticated = response.authenticated;
          return this.authenticated;
        }),
        catchError(() => {
          this.authenticated = false;
          return of(false);
        })
      );
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
        // Ya no es necesario almacenar el token en sessionStorage
        // La cookie 'jwtToken' ya está establecida por el backend

        // Opcional: Almacenar el userId en sessionStorage o localStorage si es necesario
        sessionStorage.setItem('userId', data.userId);

        this.loggedIn.next(true);
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
    return this.http.post<{ userId: string }>(`${this.baseUrl}/google-login`, { token }, { withCredentials: true });
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl2}/${userId}`, {
      withCredentials: true
    });
  }

  getUserDetails(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl2}/user-details`, {
      withCredentials: true
    });
  }


}
