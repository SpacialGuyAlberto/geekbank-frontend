import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TigoService {
  private apiUrl = 'http://localhost:7070/api/orders';

  constructor(private http: HttpClient) {}

  placeOrder(orderDetails: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(this.apiUrl, orderDetails, { headers, responseType: 'text' });
  }
}
