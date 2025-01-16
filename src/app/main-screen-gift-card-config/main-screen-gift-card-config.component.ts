// src/app/components/main-screen-gift-card-config/main-screen-gift-card-config.component.ts

import { Component, OnInit } from '@angular/core';
import {MainScreenGiftCardService} from "../main-screen-gift-card-service.service";
import {KinguinService} from "../kinguin.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import {MainScreenGiftCardItemDTO} from "../models/MainScreenGiftCardItem";
import {KinguinGiftCard} from "../models/KinguinGiftCard";
import {SearchBarComponent} from "../search-bar/search-bar.component";
import {CurrencyPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {error} from "@angular/compiler-cli/src/transformers/util";
import {Page} from "../models/Page.model";

@Component({
  selector: 'app-main-screen-gift-card-config',
  standalone: true,
  imports: [
    SearchBarComponent,
    CurrencyPipe,
    NgForOf,
    FormsModule,
    MatButtonModule,
    NgIf,
    NgClass,
    // Otros módulos necesarios
  ],
  templateUrl: './main-screen-gift-card-config.component.html',
  styleUrls: ['./main-screen-gift-card-config.component.css']
})
export class MainScreenGiftCardConfigComponent implements OnInit {
  giftCards: KinguinGiftCard[] = [];
  mainScreenGiftCardItems: MainScreenGiftCardItemDTO[] = []
  currentGiftCards: KinguinGiftCard[] = [];
  currentPage: number = 0;
  pageSize: number = 10; // la cantidad que desees
  totalPages: number = 0;
  isListView: boolean = false;

  constructor(
    private mainScreenGiftCardService: MainScreenGiftCardService,
    private kinguinService: KinguinService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadGiftCards(this.currentPage, this.pageSize);
  }

  handleSearchResults(results: KinguinGiftCard[]): void {
    this.giftCards = results;
    console.log('Search Results in Gift Cards Component: ', this.giftCards);
  }

  toggleViewMode(): void {
    this.isListView = !this.isListView;
  }

  addToGiftCards(card: KinguinGiftCard): void {
    if (!this.currentGiftCards.includes(card)) {
      this.currentGiftCards.push(card);
    }
  }

  removeFromGiftCards(cardToRemove: KinguinGiftCard): void {
    this.currentGiftCards = this.currentGiftCards.filter((card) => card !== cardToRemove);
  }

  loadGiftCards(page: number, size: number): void {
    this.mainScreenGiftCardService.getMainScreenGiftCardItems(page, size)
      .subscribe({
        next: (res: any) => {
          console.log('Raw response from server:', res);

          let items: MainScreenGiftCardItemDTO[] = [];

          // CASO A) Si 'res' es un array plano [ { mainScreenGiftCardItem, giftcard }, ... ]
          if (Array.isArray(res)) {
            items = res;
            // No hay paginación real, asígnalos manual
            this.currentPage = 0;
            this.totalPages = 1;

            // CASO B) Si 'res' es un objeto Page<MainScreenGiftCardItemDTO> con { content, totalPages, number, ... }
          } else if (res && Array.isArray(res.content)) {
            items = res.content;
            // Leer la paginación real del back-end
            this.currentPage = res.number;
            this.totalPages = res.totalPages;

          } else {
            // CASO C) Estructura desconocida
            console.warn('Respuesta sin "content" ni arreglo válido. Estructura desconocida.');
            return;
          }

          // Ahora 'items' es un array de MainScreenGiftCardItemDTO
          // Si quieres mostrar esa lista, la guardas:
          this.mainScreenGiftCardItems = items;

          // Si quieres poblar el panel “Mis Tarjetas de Regalo Destacadas”:
          this.currentGiftCards = items.map(dto => dto.giftcard);

          // Aquí podrías hacer más lógica si lo deseas...
        },
        error: (err) => {
          console.error('Error fetching paginated giftcards', err);
          this.showSnackBar("Failed loading gift cards.");
        }
      });
  }


  onNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadGiftCards(this.currentPage, this.pageSize);
    }
  }

  onPrevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadGiftCards(this.currentPage, this.pageSize);
    }
  }

  save(): void {
    // Obtener los IDs de las tarjetas existentes
    const existingProductIds = this.mainScreenGiftCardItems.map(item => item.giftcard.kinguinId);

    // Obtener los IDs de las nuevas tarjetas que se desean añadir
    const newProductIds = this.currentGiftCards.map(card => card.kinguinId);

    // Primero, eliminar las tarjetas existentes
    this.mainScreenGiftCardService.removeMainScreenGiftCardItems(existingProductIds).subscribe(
      () => {
        console.log('Tarjetas de regalo existentes eliminadas correctamente.');
        this.showSnackBar("Tarjetas antiguas eliminadas.");

        // Luego, añadir las nuevas tarjetas de regalo
        this.mainScreenGiftCardService.addMainScreenGiftCardItems(newProductIds).subscribe(
          () => {
            console.log('Nuevas tarjetas de regalo añadidas correctamente.');
            this.showSnackBar("Cambios guardados exitosamente.");
          },
          (error) => {
            console.error('Error al añadir nuevas tarjetas de regalo', error);
            this.showSnackBar("Error al guardar los cambios.");
          }
        );
      },
      (error) => {
        console.error('Error al eliminar tarjetas de regalo existentes', error);
        this.showSnackBar("Error al eliminar tarjetas antiguas.");
      }
    );
  }


  showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }

}
