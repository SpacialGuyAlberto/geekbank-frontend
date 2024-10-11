// src/app/services/user.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Transaction } from './transactions.service';
import { User } from './models/User';
import {environment} from "../environments/environment";
import { KinguinGiftCard } from './models/KinguinGiftCard';
import {DetailsBody} from './models/details-body'

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/users`;
  private usersSubject: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);

  constructor(private http: HttpClient) { }

  /**
   * Actualiza los detalles del usuario.
   * @param details - Objeto con los detalles del usuario a actualizar.
   * @returns Observable con la respuesta del servidor.
   */
  updateDetails(details: DetailsBody): Observable<HttpResponse<any>> {
    return this.http.post<HttpResponse<any>>(`${this.baseUrl}/update-user-details`, details, { observe: 'response' }).pipe(
      tap(response => {
        const token = response.headers.get('Authorization');
        if (token) {
          this.setToken(token);
        }
      })
    );
  }

  /**
   * Establece una nueva contraseña para el usuario.
   * @param token - Token de validación para el cambio de contraseña.
   * @param password - Nueva contraseña del usuario.
   * @returns Observable con la respuesta del servidor.
   */
  setPassword(token: string, password: string): Observable<HttpResponse<any>> {
    const url = `${this.baseUrl}/setPassword`;
    const body = { token, password };
    return this.http.post<HttpResponse<any>>(url, body, { observe: 'response' }).pipe(
      tap(response => {
        const newToken = response.headers.get('Authorization');
        if (newToken) {
          this.setToken(newToken);
        }
      })
    );
  }

  /**
   * Guarda el token de autenticación en el almacenamiento local.
   * @param token - Token de autenticación JWT.
   */
  setToken(token: string): void {
    if (this.isBrowser()) {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  /**
   * Obtiene el token de autenticación desde el almacenamiento local.
   * @returns El token de autenticación o null si no existe.
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Verifica si el entorno es el navegador.
   * @returns Verdadero si está en el navegador, falso de lo contrario.
   */
  isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Obtiene la lista de usuarios.
   * @returns Observable con la lista de usuarios.
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}`);
  }

  // Método opcional para obtener transacciones
  // getTransactions(): Observable<Transaction[]> {
  //   return this.http.get<Transaction[]>(`${this.baseUrl}/transactions`);
  // }
}
