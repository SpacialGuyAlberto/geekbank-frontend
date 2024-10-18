// websocket.service.ts
import { Injectable } from '@angular/core';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, Subject } from 'rxjs';
import {environment} from "../environments/environment";


@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private stompClient: any;
  private transactionStatusSubject: Subject<string> = new Subject<string>();
  private transactionNumberSubject: Subject<string> = new Subject<string>();
  private apiUrl = environment.apiUrl;

  connect(): void {
    const socket = new SockJS(`${this.apiUrl}/ws`);
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, () => {
      console.log('Connected to WebSocket');
    }, (error: Error) => {
      console.error('Error during WebSocket connection:', error);
    });

    socket.onclose = () => {
      console.log('WebSocket connection closed');
      this.reconnect();
    };
  }

  reconnect(): void {
    setTimeout(() => {
      console.log('Reconnecting to WebSocket...');
      this.connect(); // Intentar reconectar después de un tiempo
    }, 5000); // Intentar reconectar después de 5 segundos
  }


  subscribeToTransactionStatus(phoneNumber: string): Observable<string> {
    const url = `/topic/transaction-status/${phoneNumber}`;

    this.stompClient.subscribe(url, (message: any) => {
      this.transactionStatusSubject.next(message.body);
    });

    return this.transactionStatusSubject.asObservable();
  }

  subscribeToTransactionNumber() : Observable<string> {
    const url = `/topic/transaction-number`;

    this.stompClient.subscribe(url, (message: any) => {
      this.transactionNumberSubject.next(message.body);
    });

    return this.transactionNumberSubject.asObservable();
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect(() => {
        console.log('Disconnected from WebSocket');
      });
    }
  }
}
