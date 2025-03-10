// src/app/services/sync.service.ts

// src/app/services/sync.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, interval, BehaviorSubject, Subscription } from 'rxjs';
import { switchMap, takeWhile, tap } from 'rxjs/operators';
import {
  ProgressResponse,
  TotalResponse,
  SynchronizedResponse,
  MessageResponse
} from './sync-responses';


// src/app/services/sync.service.ts

@Injectable({
  providedIn: 'root'
})
export class SyncService {

  private apiUrl = 'http://localhost:7070/api/sync'; // Reemplaza con tu URL real

  private progressSubject = new BehaviorSubject<number>(0);
  progress$ = this.progressSubject.asObservable();

  private isSyncingSubject = new BehaviorSubject<boolean>(false);
  isSyncing$ = this.isSyncingSubject.asObservable();

  private totalGiftCardsSubject = new BehaviorSubject<number>(0);
  totalGiftCards$ = this.totalGiftCardsSubject.asObservable();

  private synchronizedGiftCardsSubject = new BehaviorSubject<number>(0);
  synchronizedGiftCards$ = this.synchronizedGiftCardsSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Iniciar la sincronización
  startSync(): Observable<HttpResponse<MessageResponse>> {
    this.isSyncingSubject.next(true);
    return this.http.post<MessageResponse>(`${this.apiUrl}/giftcards`, {}, { observe: 'response' });
  }

  // Sondeo del progreso, total y sincronizados
  pollProgress(): void {
    // Sondeo del progreso cada 1 segundo
    const progressSubscription = interval(1000).pipe(
      switchMap(() => this.http.get<ProgressResponse>(`${this.apiUrl}/progress`)),
      tap((progressData) => this.progressSubject.next(progressData.progress)),
      takeWhile((progressData) => progressData.progress < 100, true) // Continuar hasta que el progreso sea 100
    ).subscribe({
      next: (progressData) => {
        if (progressData.progress >= 100) {
          this.isSyncingSubject.next(false);
        }
      },
      error: (err) => {
        console.error('Error al obtener el progreso:', err);
        this.isSyncingSubject.next(false);
      }
    });

    // Sondeo del total de GiftCards
    const totalSubscription = interval(1000).pipe(
      switchMap(() => this.http.get<TotalResponse>(`${this.apiUrl}/total`)),
      tap((totalData) => this.totalGiftCardsSubject.next(totalData.total))
    ).subscribe();

    // Sondeo del número de GiftCards sincronizadas
    const synchronizedSubscription = interval(1000).pipe(
      switchMap(() => this.http.get<SynchronizedResponse>(`${this.apiUrl}/synchronized`)),
      tap((syncedData) => this.synchronizedGiftCardsSubject.next(syncedData.synchronized))
    ).subscribe();
  }

  // Cancelar la sincronización
  cancelSync(): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/cancel`, {}, { observe: 'response' });
  }

  // Obtener el estado de sincronización
  getStatus(): Observable<{ isSyncing: boolean }> {
    return this.http.get<{ isSyncing: boolean }>(`${this.apiUrl}/status`);
  }

}

