import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {AuthService} from "./auth.service";
import {Auth} from "@angular/fire/auth";

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private baseUrl = 'http://localhost:7070/api/home';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getHomeData(): Observable<string> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<string>(this.baseUrl, { headers });
  }
}

