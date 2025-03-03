import { Injectable } from '@angular/core';
import {HttpClient, HttpParams, HttpResponse} from "@angular/common/http";
import {Router} from "@angular/router";
import {Observable, throwError} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {CurrencyApiResponse} from "../models/currency-api-response.model";

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiUrl = 'https://api.currencybeacon.com/v1/convert';
  private apiKey = '3NLYjNbOf7n1eayS4e2m2vDkAEuj6tJX';
  constructor(private router: Router, private http: HttpClient) { }

  getExchangeRateEURtoHNL(amountInEUR: number): Observable<number> {
    const params = new HttpParams()
      .set('from', 'EUR')
      .set('to', 'HNL')
      .set('amount', amountInEUR.toString())
      .set('api_key', this.apiKey);

    return this.http.get<CurrencyApiResponse>(this.apiUrl, { params }).pipe(
      map(response => {
        if (response && response.response && typeof response.response.value === 'number' && response.response.amount !== 0) {
          return response.response.value / response.response.amount; // Tasa de cambio HNL por 1 EUR
        } else {
          throw new Error('Respuesta de conversión inválida');
        }
      }),
      catchError(error => {
        console.error('Error en CurrencyService.getExchangeRateEURtoHNL:', error);
        return throwError(() => new Error('Error al obtener la tasa de cambio EUR a HNL'));
      })
    );
  }
}

//https://v6.exchangerate-api.com/v6/YOUR-API-KEY/pair/EUR/GBP
//'https://v6.exchangerate-api.com/v6/2333e3e5da9d819030f14e09/latest/EUR';

///3NLYjNbOf7n1eayS4e2m2vDkAEuj6tJX
//https://api.currencybeacon.com/v1/convert


//https://api.currencybeacon.com/v1/convert?from=EUR?to=HNL?api_key=baa9dc110aa712sd3a9fa2a3dwb6c01d4c875950dc32vs
