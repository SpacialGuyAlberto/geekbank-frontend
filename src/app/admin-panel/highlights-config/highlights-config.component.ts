import {Component, NgIterable} from '@angular/core';
import {SearchBarComponent} from "../../search-bar/search-bar.component";
import {KinguinGiftCard} from "../../models/KinguinGiftCard";
import {CurrencyPipe, NgForOf} from "@angular/common";


@Component({
  selector: 'app-highlights-config',
  standalone: true,
  imports: [
    SearchBarComponent,
    CurrencyPipe,
    NgForOf
  ],
  templateUrl: './highlights-config.component.html',
  styleUrl: './highlights-config.component.css'
})
export class HighlightsConfigComponent {
  giftCards: KinguinGiftCard[] = [];
  currentHighlights: KinguinGiftCard[] = [];
  card: KinguinGiftCard | undefined;

  handleSearchResults(results: KinguinGiftCard[]): void {
    this.giftCards = results;
    console.log('Search Results in Gift Cards Component: ', this.giftCards);
  }

  addToHighlights(card: KinguinGiftCard): void {
    this.card = card;
    this.currentHighlights.push(card)
  }

  removeFromHighlights(cardToRemove: KinguinGiftCard): void {
    this.currentHighlights = this.currentHighlights.filter(card => card !== cardToRemove);
  }

  save(){

  }
}
