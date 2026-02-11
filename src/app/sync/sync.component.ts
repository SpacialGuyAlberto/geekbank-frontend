// src/app/sync/sync.component.ts

import { Component, OnDestroy, OnInit } from '@angular/core';
import { SyncService } from './sync.service';
import { Subscription } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { MessageResponse } from './sync-responses';
import {MatIcon} from "@angular/material/icon";
import {NgIf} from "@angular/common";
import {MatProgressBar} from "@angular/material/progress-bar";

@Component({
    selector: 'app-sync',
    templateUrl: './sync.component.html',
    imports: [
        MatIcon,
        NgIf,
        MatProgressBar
    ],
    styleUrls: ['./sync.component.css']
})
export class SyncComponent implements OnInit, OnDestroy {

  progress: number = 0;
  isSyncing: boolean = false;
  totalGiftCards: number = 0;
  synchronizedGiftCards: number = 0;
  syncMessage: string = '';
  private subscriptions: Subscription = new Subscription();

  constructor(private syncService: SyncService) { }

  ngOnInit(): void {
    // Suscribirse al progreso
    const progressSub = this.syncService.progress$.subscribe((prog) => {
      this.progress = prog;
    });
    this.subscriptions.add(progressSub);

    // Suscribirse al estado de sincronización
    const statusSub = this.syncService.isSyncing$.subscribe((syncing) => {
      this.isSyncing = syncing;
      if (!syncing && this.progress === 100) {
        this.syncMessage = 'Sincronización completada.';
      }
    });
    this.subscriptions.add(statusSub);

    // Suscribirse al total de GiftCards
    const totalSub = this.syncService.totalGiftCards$.subscribe((total) => {
      this.totalGiftCards = total;
    });
    this.subscriptions.add(totalSub);

    // Suscribirse al número de GiftCards sincronizadas
    const syncedSub = this.syncService.synchronizedGiftCards$.subscribe((synced) => {
      this.synchronizedGiftCards = synced;
    });
    this.subscriptions.add(syncedSub);
  }

  startSync(): void {
    this.syncMessage = 'Sincronización iniciada...';
    const syncSub = this.syncService.startSync().subscribe({
      next: (response: HttpResponse<MessageResponse>) => {
        if (response.ok) {
          this.syncMessage = response.body?.message || 'Sincronización de GiftCards iniciada.';
          this.syncService.pollProgress(); // Iniciar el sondeo del progreso
        } else {
          this.syncMessage = 'Error al iniciar la sincronización.';
        }
      },
      error: (err) => {
        console.error('Error al iniciar la sincronización:', err);
        this.syncMessage = 'Error al iniciar la sincronización.';
      },
      complete: () => {
        // Opcional: Puedes realizar acciones adicionales al completar
      }
    });
    this.subscriptions.add(syncSub);
  }

  cancelSync(): void {
    const cancelSub = this.syncService.cancelSync().subscribe({
      next: (response: HttpResponse<MessageResponse>) => {
        if (response.ok) {
          this.syncMessage = response.body?.message || 'Sincronización de GiftCards cancelada.';
        } else {
          this.syncMessage = 'Error al cancelar la sincronización.';
        }
      },
      error: (err) => {
        console.error('Error al cancelar la sincronización:', err);
        this.syncMessage = 'Error al cancelar la sincronización.';
      },
      complete: () => {
        // Opcional: Puedes realizar acciones adicionales al completar
      }
    });
    this.subscriptions.add(cancelSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
