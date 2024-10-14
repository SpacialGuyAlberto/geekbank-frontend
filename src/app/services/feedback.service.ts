import { Injectable } from '@angular/core';
import { Feedback } from "../models/Feedback";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = environment.apiUrl;
  private baseUrl = `${this.apiUrl}/feedbacks`;

  constructor(private http: HttpClient) {}

  // Método para obtener todos los feedbacks
  fetchAllFeedbacks(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.baseUrl}`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
    });
  }

  // Método para obtener un feedback por ID
  getFeedbackById(id: number): Observable<Feedback> {
    return this.http.get<Feedback>(`${this.baseUrl}/${id}`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
    });
  }

  // Método para crear un nuevo feedback
  createFeedback(feedback: Partial<Feedback>): Observable<Feedback> {
    return this.http.post<Feedback>(this.baseUrl, feedback, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      })
    });
  }

  // Método para obtener feedbacks por productId
  getFeedbacksByProductId(productId: string): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.baseUrl}/product/${productId}`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
    });
  }

  // Método para obtener feedbacks por userId
  getFeedbacksByUserId(userId: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.baseUrl}/user/${userId}`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
    });
  }

  // Método para actualizar un feedback
  updateFeedback(id: number, feedback: Partial<Feedback>): Observable<Feedback> {
    return this.http.put<Feedback>(`${this.baseUrl}/${id}`, feedback, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      })
    });
  }

  // Método para eliminar un feedback
  deleteFeedback(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
    });
  }
}
