import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {AuthService} from "../services/auth.service";
import {Auth} from "@angular/fire/auth";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private apiUrl = environment.apiUrl
  private baseUrl = `${this.apiUrl}/home`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getHomeData(): Observable<string> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<string>(this.baseUrl, { headers });
  }
}

