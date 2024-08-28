import { Component } from '@angular/core';
import { SearchBarComponent } from "../../search-bar/search-bar.component";
import { KinguinGiftCard } from "../../models/KinguinGiftCard";
import { CurrencyPipe, NgForOf } from "@angular/common";
import {HighlightService} from "../../highlights.service";
import {OnInit} from "@angular/core";
import {HighlightItemWithGiftcard} from "../../models/HighlightItem";

@Component({
  selector: 'app-highlights-config',
  standalone: true,
  imports: [
    SearchBarComponent,
    CurrencyPipe,
    NgForOf
  ],
  templateUrl: './highlights-config.component.html',
  styleUrls: ['./highlights-config.component.css']
})
export class HighlightsConfigComponent {
  giftCards: KinguinGiftCard[] = [];
  highlightItems: HighlightItemWithGiftcard[] = [];
  currentHighlights: KinguinGiftCard[] = [];
  card: KinguinGiftCard | undefined;

  constructor(private highlightService: HighlightService) {}

  ngOnInit() {
    this.highlightService.getHighlights().subscribe(data =>
        data.map( item => this.currentHighlights.push(item.giftcard))
    );
  }

  handleSearchResults(results: KinguinGiftCard[]): void {
    this.giftCards = results;
    console.log('Search Results in Gift Cards Component: ', this.giftCards);
  }

  addToHighlights(card: KinguinGiftCard): void {
    if (!this.currentHighlights.includes(card)){
      this.currentHighlights.push(card);
    }
  }

  removeFromHighlights(cardToRemove: KinguinGiftCard): void {
    this.currentHighlights = this.currentHighlights.filter(card => card !== cardToRemove);
  }


  save(): void {
    const productIds = this.currentHighlights.map(card => card.kinguinId);
    const highlightIds = this.highlightItems.map(card => card.giftcard.kinguinId)

    this.highlightService.removeHighlights(productIds).subscribe(
      () => {
        console.log('Previous highlights removed successfully!');
        this.highlightService.addHighlights(productIds).subscribe(
          () => {
            console.log('Highlights saved successfully!');
          },
          (error) => {
            console.error('Failed to save highlights', error);
          }
        );
      },
      (error) => {
        console.error('Failed to remove previous highlights', error);
      }
    );
  }
}
