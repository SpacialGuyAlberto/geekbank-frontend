import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {GiftCard} from "./models/GiftCard";
@Injectable({
  providedIn: 'root'
})
export class FreeFireGiftCardService {
  private apiUrl = 'http://localhost:7070/api/gift-cards/free-fire'; // URL del controlador en Spring Boot

  constructor(private http: HttpClient) {}

  getFreeFireGiftCard(): Observable<GiftCard> {
    return this.http.get<GiftCard>(this.apiUrl);
  }
}
