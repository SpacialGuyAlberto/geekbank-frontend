import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {TournamentInscriptionDTO} from "./model/tournamentInscriptionDto.model";
import {catchError, tap} from "rxjs/operators";
import {MainScreenGiftCardItem} from "../main-screen-gift-card-config/MainScreenGiftCardItem";
import {Observable, of} from "rxjs";
import {TournamentDTO} from "./model/TournamentDTO";


@Injectable({
  providedIn: 'root'
})
export class TournamentService {

  private apiUrl = environment.apiUrl;
  private baseUrl = `${this.apiUrl}/tournament`;

  constructor(private http: HttpClient) { }

  sendTournamentInscription(tournamentInscription: TournamentInscriptionDTO) {
    return this.http.post<TournamentInscriptionDTO>(
      `${this.baseUrl}/send`,
      tournamentInscription,
    {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }
    ).pipe(
      tap((newItem: TournamentInscriptionDTO ) => console.log(`Added ${newItem.nickname} to the tournament`)),
      catchError(this.handleError<TournamentInscriptionDTO>('addtoMainScreenGiftCards'))
    )
  };

  createTournament(tournament: TournamentDTO) {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<TournamentDTO>(
      `${this.baseUrl}/create`,
      tournament,
      { headers,
      withCredentials: true}
    ).pipe(
      tap((newItem: TournamentDTO) => {
        console.log(`¡Torneo creado: ${newItem.name}`);
      }),
      catchError(this.handleError<TournamentDTO>('createTournament'))
    );
  }


  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);

      return of(result as T);
    };
  }

}
