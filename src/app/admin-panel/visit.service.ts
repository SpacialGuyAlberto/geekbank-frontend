// visit.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class VisitService {
  private apiUrl = `${environment.apiUrl}/visits`;

  constructor(private http: HttpClient) { }

  registerVisit(sessionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register?sessionId=${sessionId}`, {});
  }

  getVisitCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }
}
