// src/app/components/manual-sales/manual-sales.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import {CurrencyPipe, DatePipe, NgForOf, NgIf} from "@angular/common";
import { Subscription } from 'rxjs';
import {WebSocketService} from "../../../web-socket.service";
import { ManualVerificationTransactionDto } from "../../../models/TransactionProductDto.model";
import {TransactionsService} from "../../../transactions.service";
import {Transaction} from "../../../models/transaction.model";

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
  pendingSales: ManualVerificationTransactionDto[] = [];
  isConnected: boolean = false;
  transactions: Transaction[] = []
  private manualVerificationSubscription: Subscription | null = null;
  private manualVerificationQueueSubscription: Subscription | null = null;
  private connectionSubscription: Subscription | null = null;

  constructor(
    private webSocketService: WebSocketService,
    private transactionService: TransactionsService
  ) {}

  ngOnInit(): void {

    this.transactionService.getWaitingForApprovalTransactions().subscribe((data) => {
      this.pendingSales = data;
    })

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
