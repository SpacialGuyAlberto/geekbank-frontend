// websocket.service.ts
import { Injectable } from '@angular/core';
import { Client, IMessage, Stomp, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {BehaviorSubject, Observable, ReplaySubject, Subject, take} from 'rxjs';
import { environment } from "../environments/environment";
import { ManualVerificationTransactionDto } from "./models/TransactionProductDto.model";
import {filter} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private stompClient: any;
  private client: Client;
  private transactionStatusSubject: Subject<any> = new Subject<any>();
  private transactionNumberSubject: Subject<string> = new Subject<string>();
  private verifyTransactionSubject: ReplaySubject<any> = new ReplaySubject<any>(1);
  private manualVerificationTransactionSubject: Subject<any> = new Subject<any>();
  private manualVerificationQueueSubject: Subject<any> = new Subject<any>();

  private isVerifyTransactionSubscribed: boolean = false;


  private connectedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public connected$: Observable<boolean> = this.connectedSubject.asObservable();

  private apiUrl = environment.apiUrl;

  constructor() {
    this.client = new Client({
      brokerURL: `${this.apiUrl}/ws`, // No es necesario con SockJS
      webSocketFactory: () => new SockJS(`${this.apiUrl}/ws`),
      reconnectDelay: 5000, // Reconectar cada 5 segundos
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => { console.log(str); },
      onConnect: (frame) => {
        console.log('Connected to WebSocket');
        this.connectedSubject.next(true);
        this.subscribeToManualVerifications();
        this.subscribeToManualVerificationQueue();
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        this.connectedSubject.next(false);
      },
      onWebSocketClose: () => {
        console.log('WebSocket connection closed');
        this.connectedSubject.next(false);
      }
    });
  }

  /**
   * Inicia la conexión WebSocket
   */
  connect(): void {
    this.client.activate();
  }

  reconnect(): void {
    setTimeout(() => {
      console.log('Reconnecting to WebSocket...');
      this.connect(); // Intentar reconectar después de un tiempo
    }, 5000); // Intentar reconectar después de 5 segundos
  }



  /**
   * Método para suscribirse al tópico de estado de la transacción
   */
  subscribeToTransactionStatus(phoneNumber: string): Observable<any> {
    this.connected$.pipe(
      filter(isConnected => isConnected),
      take(1)
    ).subscribe(() => {
      const url = `/topic/transaction-status/${phoneNumber}`;
      this.client.subscribe(url, (message: IMessage) => {
        const parsedMessage = JSON.parse(message.body);
        this.transactionStatusSubject.next(parsedMessage);
      });
    });

    return this.transactionStatusSubject.asObservable();
  }


  /**
   * Método para suscribirse al tópico de número de transacción
   */
  subscribeToTransactionNumber(): Observable<string> {
    const url = `/topic/transaction-number`;

    this.client.subscribe(url, (message: IMessage) => {
      this.transactionNumberSubject.next(message.body);
    });

    return this.transactionNumberSubject.asObservable();
  }

  /**
   * Método para suscribirse al tópico de verificación de transacción
   */
  subscribeToVerifyTransaction(phoneNumber: string): Observable<any> {
    if (!this.isVerifyTransactionSubscribed) {
      this.connected$.pipe(
        filter(isConnected => isConnected),
        take(1)
      ).subscribe(() => {
        const url = `/topic/verify-transaction/${phoneNumber}`;
        this.client.subscribe(url, (message: IMessage) => {
          const parsedMessage = JSON.parse(message.body);
          this.verifyTransactionSubject.next(parsedMessage);
        });
        this.isVerifyTransactionSubscribed = true;
      });
    }

    return this.verifyTransactionSubject.asObservable();
  }



  private subscribeToManualVerifications(): void {
    const subscription: StompSubscription = this.client.subscribe('/topic/manual-verifications', (message: IMessage) => {
      const parsedMessage: ManualVerificationTransactionDto = JSON.parse(message.body);
      console.log('Received manual verification:', parsedMessage);
      this.manualVerificationTransactionSubject.next(parsedMessage);
    });
  }

  /**
   * Método para suscribirse al tópico de cola de verificaciones manuales
   */
  private subscribeToManualVerificationQueue(): void {
    const subscription: StompSubscription = this.client.subscribe('/topic/manual-verifications-queue', (message: IMessage) => {
      const parsedMessage: ManualVerificationTransactionDto[] = JSON.parse(message.body);
      console.log('Received manual verification queue:', parsedMessage);
      this.manualVerificationQueueSubject.next(parsedMessage);
    });
  }

  getManualVerificationTransaction(): Observable<ManualVerificationTransactionDto> {
    return this.manualVerificationTransactionSubject.asObservable();
  }

  /**
   * Obtiene un observable para la cola completa de transacciones
   */
  getManualVerificationQueue(): Observable<ManualVerificationTransactionDto[]> {
    return this.manualVerificationQueueSubject.asObservable();
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      console.log('Disconnected from WebSocket');
    }
  }
}
