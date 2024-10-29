// websocket.service.ts
import { Injectable } from '@angular/core';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, Subject } from 'rxjs';
import { environment } from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private stompClient: any;
  private transactionStatusSubject: Subject<any> = new Subject<any>();
  private transactionNumberSubject: Subject<string> = new Subject<string>();
  private verifyTransactionSubject: Subject<any> = new Subject<any>();
  private apiUrl = environment.apiUrl;

  connect(): void {
    const socket = new SockJS(`${this.apiUrl}/ws`);
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, () => {
      console.log('Connected to WebSocket');
    }, (error: Error) => {
      console.error('Error during WebSocket connection:', error);
      this.reconnect();
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

  subscribeToTransactionStatus(phoneNumber: string): Observable<any> {
    const url = `/topic/transaction-status/${phoneNumber}`;

    this.stompClient.subscribe(url, (message: any) => {
      // Parsear el mensaje recibido a un objeto JSON
      const parsedMessage = JSON.parse(message.body);
      this.transactionStatusSubject.next(parsedMessage);
    });

    return this.transactionStatusSubject.asObservable();
  }

  subscribeToTransactionNumber(): Observable<string> {
    const url = `/topic/transaction-number`;

    this.stompClient.subscribe(url, (message: any) => {
      this.transactionNumberSubject.next(message.body);
    });

    return this.transactionNumberSubject.asObservable();
  }

  // Nuevo método para suscribirse al tópico de verificación de transacción
  subscribeToVerifyTransaction(phoneNumber: string): Observable<any> {
    const url = `/topic/verify-transaction/${phoneNumber}`;

    this.stompClient.subscribe(url, (message: any) => {
      const parsedMessage = JSON.parse(message.body);
      this.verifyTransactionSubject.next(parsedMessage);
    });

    return this.verifyTransactionSubject.asObservable();
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect(() => {
        console.log('Disconnected from WebSocket');
      });
    }
  }
}
