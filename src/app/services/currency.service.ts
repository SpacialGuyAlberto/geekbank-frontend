import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";

// Definimos una interfaz local para el nuevo formato si no quieres cambiar tu modelo global aún
interface NewCurrencyResponse {
  base: string;
  result: { [key: string]: number }; // Esto permite dinámicamente cualquier moneda, ej: "HNL": 26.63
  updated: string;
  ms: number;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  // Ajustamos la URL base (sin parámetros hardcodeados para mayor flexibilidad)
  private apiUrl = 'https://api.fastforex.io/fetch-one';
  private apiKey = 'b9d3660a3a-6bafdb4a39-tf0o50';

  constructor(private http: HttpClient) { }

  getExchangeRateEURtoHNL(amountInEUR: number): Observable<number> {
    const params = new HttpParams()
      .set('from', 'EUR')
      .set('to', 'HNL')
      .set('api_key', this.apiKey);

    return this.http.get<NewCurrencyResponse>(this.apiUrl, { params }).pipe(
      map(response => {
        // Accedemos a response.result['HNL']
        if (response && response.result && response.result['HNL']) {
          const rate = response.result['HNL'];
          // Si el API ya te da el precio por 1 unidad, solo multiplicamos por el amount
          return rate * amountInEUR;
        } else {
          throw new Error('Estructura de respuesta no reconocida o moneda no encontrada');
        }
      }),
      catchError(error => {
        console.error('Error en CurrencyService:', error);
        return throwError(() => new Error('Error al obtener la tasa de cambio de la nueva API'));
      })
    );
  }
}
