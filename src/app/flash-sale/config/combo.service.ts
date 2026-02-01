import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {Combo} from "./models/Combo";



@Injectable({
    providedIn: 'root'
})
export class ComboService {
    private apiUrl = `${environment.apiUrl}/combos`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Combo[]> {
        return this.http.get<Combo[]>(this.apiUrl);
    }

    getById(id: number): Observable<Combo> {
        return this.http.get<Combo>(`${this.apiUrl}/${id}`);
    }

    create(combo: Combo): Observable<Combo> {
        return this.http.post<Combo>(this.apiUrl, combo);
    }

    update(id: number, combo: Combo): Observable<Combo> {
        return this.http.put<Combo>(`${this.apiUrl}/${id}`, combo);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
