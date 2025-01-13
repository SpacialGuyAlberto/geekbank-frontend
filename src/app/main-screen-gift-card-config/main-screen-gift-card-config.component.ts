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
      .subscribe((response) => {
          // Valida que 'response.content' sea un array
          if (!response.content) {
            console.warn('Respuesta sin "content".');
            return;
          }

          // page e items
          this.currentPage = response.number;
          this.totalPages = response.totalPages;

          // Mapea
          this.mainScreenGiftCardItems = response.content;
          this.currentGiftCards = response.content.map(dto => dto.giftcard);
        },
        error => {
          console.error('Error fetching paginated giftcards', error);
          this.showSnackBar("Failed loading gift cards.");
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
    const productIds = this.currentGiftCards.map((card) => card.kinguinId);

    this.mainScreenGiftCardService.removeMainScreenGiftCardItems([]).subscribe(
      () => {
        console.log('Previous highlights removed successfully!');
        this.showSnackBar("Changes saved successfully.")
        this.mainScreenGiftCardService.addMainScreenGiftCardItems(productIds).subscribe(
          () => {
            console.log('Highlights saved successfully!');
            this.showSnackBar("Changes saved successfully.")
          },
          (error) => {
            console.error('Failed to save highlights', error);
            this.showSnackBar("Failed saving changes.")
          }
        );
      },
      (error) => {
        console.error('Failed to remove previous highlights', error);
        this.showSnackBar("Failed saving changes.")
      }
    );
  }

  showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }

}
