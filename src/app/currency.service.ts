import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from "@angular/common/http";
import {Router} from "@angular/router";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private url = 'https://v6.exchangerate-api.com/v6/2333e3e5da9d819030f14e09/pair/EUR/HNL';
  constructor(private router: Router, private http: HttpClient) { }

  getCurrency(): Observable<any>{
    return this.http.get(
      `${this.url}`
    )
  }
}

//https://v6.exchangerate-api.com/v6/YOUR-API-KEY/pair/EUR/GBP
//'https://v6.exchangerate-api.com/v6/2333e3e5da9d819030f14e09/latest/EUR';
