import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {FreeFireDiamondProduct} from "./models/free-fire-diamond-product.interface";

@Injectable({
  providedIn: 'root'
})
export class FreeFireProductService {
  private apiUrl = 'http://localhost:7070/api/freefire/products'; // URL del endpoint de productos de Free Fire

  constructor(private http: HttpClient) {}

  // Método para obtener los productos de Free Fire
  getFreeFireProducts(): Observable<FreeFireDiamondProduct[]> {
    return this.http.get<FreeFireDiamondProduct[]>(this.apiUrl);
  }
}
