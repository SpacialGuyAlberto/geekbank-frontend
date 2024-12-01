// src/app/components/manual-sales/manual-sales.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CurrencyPipe, DatePipe, NgForOf, NgIf } from "@angular/common";
import { Subscription } from 'rxjs';
import { WebSocketService } from "../../../web-socket.service";
import { ManualVerificationTransactionDto } from "../../../models/TransactionProductDto.model";
import { TransactionsService } from "../../../transactions.service";
import { Transaction } from "../../../models/transaction.model";
import {ManualOrdersService} from "../../../manual-order.service";
import {OrderService} from "../../../order.service";
import {Order} from "../../../models/order.model";

@Component({
  selector: 'app-manual-sales',
  standalone: true,
  imports: [
    NgForOf,
    CurrencyPipe,
    DatePipe,
    NgIf
  ],
  templateUrl: './manual-sales.component.html',
  styleUrls: ['./manual-sales.component.css']
})
export class ManualSalesComponent implements OnInit, OnDestroy {
  order: Order | null = null;
  pendingSales: ManualVerificationTransactionDto[] = [];
  isConnected: boolean = false;
  transactions: Transaction[] = [];
  transaction: Transaction  | null = null;
  isModalOpen: boolean = false; // Controla la visibilidad del modal
  // Subscriptions
  private manualVerificationSubscription: Subscription | null = null;
  private manualVerificationQueueSubscription: Subscription | null = null;
  private connectionSubscription: Subscription | null = null;

  constructor(
    private orderService: OrderService,
    private webSocketService: WebSocketService,
    private transactionService: TransactionsService,
    private manualOrdersService: ManualOrdersService // Inyectar el servicio
  ) {}

  ngOnInit(): void {
    this.transactionService.getWaitingForApprovalTransactions().subscribe((data) => {
      this.pendingSales = data;
    });

    this.webSocketService.connect();

    this.connectionSubscription = this.webSocketService.connected$.subscribe(connected => {
      this.isConnected = connected;
      if (connected) {
        console.log('WebSocket connected, subscribing to topics.');
      } else {
        console.warn('Not connected to WebSocket.');
      }
    });

    this.manualVerificationSubscription = this.webSocketService.getManualVerificationTransaction().subscribe(transaction => {
      this.pendingSales.push(transaction);
      console.log('Transaction added to pending sales:', transaction);
    });

    this.manualVerificationQueueSubscription = this.webSocketService.getManualVerificationQueue().subscribe(queue => {
      this.pendingSales = queue;
      console.log('Full transaction queue received:', queue);
    });
  }

  /**
   * Función para completar la venta
   * @param transactionNumber Número de transacción a completar
   */
  completeSale(transactionNumber: string): void {
    this.pendingSales = this.pendingSales.filter(sale => sale.transactionNumber !== transactionNumber);
    console.log(`Venta con transacción ${transactionNumber} completada`);
  }

  openModal(transactionNumber: string): void {
    this.fetchOrderInfo(transactionNumber);
    this.isModalOpen = true; // Abre el modal
  }
  closeModal(): void {
    this.isModalOpen = false;
  }


  /**
   * Función para ejecutar una orden manual
   */
  runManualOrder(transaction: string): void {
    console.log(transaction);
    this.manualOrdersService.runManualOrder(transaction).subscribe({
      next: (response) => {
        console.log('Orden manual ejecutada exitosamente:', response);
        console.log("Transaction Number", transaction)
        // Puedes manejar la respuesta según tus necesidades, por ejemplo, actualizar la lista de ventas pendientes
      },
      error: (error) => {
        console.error('Error al ejecutar la orden manual:', error);
        // Maneja el error según tus necesidades, por ejemplo, mostrar un mensaje al usuario
      }
    });
  }

  fetchOrderInfo(transactionNumber: string) {
      this.orderService.findOrder(transactionNumber).subscribe( data => {
        this.order = data;
      });
  }

  ngOnDestroy(): void {
    if (this.manualVerificationSubscription) {
      this.manualVerificationSubscription.unsubscribe();
    }
    if (this.manualVerificationQueueSubscription) {
      this.manualVerificationQueueSubscription.unsubscribe();
    }
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }
}
