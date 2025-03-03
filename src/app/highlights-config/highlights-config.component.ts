import { Component } from '@angular/core';
import {SearchBarComponent} from "../search-bar/search-bar.component";

import {KinguinGiftCard} from "../kinguin-gift-cards/KinguinGiftCard";
import { CurrencyPipe, NgForOf } from "@angular/common";
import {HighlightService} from "./highlights.service";
import {OnInit} from "@angular/core";
import {HighlightItemWithGiftcard} from "./HighlightItem";
import {KinguinService} from "../kinguin-gift-cards/kinguin.service";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";

@Component({
  selector: 'app-highlights-config',
  standalone: true,
  imports: [
    SearchBarComponent,
    CurrencyPipe,
    NgForOf,
    MatSnackBarModule
  ],
  templateUrl: './highlights-config.component.html',
  styleUrls: ['./highlights-config.component.css']
})


export class HighlightsConfigComponent implements OnInit {
  giftCards: KinguinGiftCard[] = [];
  highlightItems: HighlightItemWithGiftcard[] = [];
  currentHighlights: KinguinGiftCard[] = [];

  constructor(
    private highlightService: HighlightService,
    private kinguinService: KinguinService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.highlightService.getHighlights().subscribe((data) => {
      data.map((item) => this.currentHighlights.push(item.giftcard));
    });

    this.kinguinService.getGiftCardsModel().subscribe((data: KinguinGiftCard[]) => {
      this.giftCards = data;
    });
  }

  handleSearchResults(results: KinguinGiftCard[]): void {
    this.giftCards = results;
    console.log('Search Results in Gift Cards Component: ', this.giftCards);
  }

  addToHighlights(card: KinguinGiftCard): void {
    if (!this.currentHighlights.includes(card)) {
      this.currentHighlights.push(card);
    }
  }

  removeFromHighlights(cardToRemove: KinguinGiftCard): void {
    this.currentHighlights = this.currentHighlights.filter((card) => card !== cardToRemove);
  }

  save(): void {
    const productIds = this.currentHighlights.map((card) => card.kinguinId);

    this.highlightService.removeHighlights([]).subscribe(
      () => {
        console.log('Previous highlights removed successfully!');
        this.showSnackBar("Changes saved successfully.")
        this.highlightService.addHighlights(productIds).subscribe(
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
