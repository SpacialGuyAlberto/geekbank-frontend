// src/app/components/main-screen-gift-card-config/main-screen-gift-card-config.component.ts

import { Component, OnInit } from '@angular/core';
import {MainScreenGiftCardService} from "../main-screen-gift-card-service.service";
import {KinguinService} from "../kinguin.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import {MainScreenGiftCardItemDTO} from "../models/MainScreenGiftCardItem";
import {KinguinGiftCard} from "../models/KinguinGiftCard";
import {SearchBarComponent} from "../search-bar/search-bar.component";
import { CurrencyPipe, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {error} from "@angular/compiler-cli/src/transformers/util";

@Component({
  selector: 'app-main-screen-gift-card-config',
  standalone: true,
  imports: [
    SearchBarComponent,
    CurrencyPipe,
    NgForOf,
    FormsModule,
    MatButtonModule,
    // Otros módulos necesarios
  ],
  templateUrl: './main-screen-gift-card-config.component.html',
  styleUrls: ['./main-screen-gift-card-config.component.css']
})
export class MainScreenGiftCardConfigComponent implements OnInit {
  giftCards: KinguinGiftCard[] = [];
  mainScreenGiftCardItems: MainScreenGiftCardItemDTO[] = [];
  currentGiftCards: KinguinGiftCard[] = [];

  constructor(
    private mainScreenGiftCardService: MainScreenGiftCardService,
    private kinguinService: KinguinService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.mainScreenGiftCardService.getMainScreenGiftCardItems().subscribe((data) => {
      data.forEach((item) => {
        if (item.giftcard) {
          this.currentGiftCards.push(item.giftcard);
        }
      });
    });

    this.kinguinService.getGiftCardsModel().subscribe((data: KinguinGiftCard[]) => {
      this.giftCards = data;
    });
  }

  handleSearchResults(results: KinguinGiftCard[]): void {
    this.giftCards = results;
    console.log('Search Results in Gift Cards Component: ', this.giftCards);
  }

  addToGiftCards(card: KinguinGiftCard): void {
    if (!this.currentGiftCards.includes(card)) {
      this.currentGiftCards.push(card);
    }
  }

  removeFromGiftCards(cardToRemove: KinguinGiftCard): void {
    this.currentGiftCards = this.currentGiftCards.filter((card) => card !== cardToRemove);
  }

  save(): void {
    const productIds = this.currentGiftCards.map((card) => card.kinguinId);

    this.mainScreenGiftCardService.removeMainScreenGiftCardItems([]).subscribe(
      () => {
        this.showSnackBar("Changes saved successfully.")
        this.mainScreenGiftCardService.addMainScreenGiftCardItems(productIds).subscribe(
          () => {
            this.showSnackBar("Failed saving changes.")
          }
        );
      },
      (error) => {
        this.showSnackBar("Failed to save changes.");
      }
    )
  }

  showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }

}
