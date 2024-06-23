import { Component, Output, EventEmitter } from '@angular/core';
import { KinguinService } from '../kinguin.service';
import { KinguinGiftCard } from '../models/KinguinGiftCard';
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-search-bar',
  standalone: true,
  templateUrl: './search-bar.component.html',
  imports: [
    FormsModule
  ],
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent {
  @Output() searchResults = new EventEmitter<KinguinGiftCard[]>();
  searchQuery: string = '';

  constructor(private kinguinService: KinguinService) {}

  searchGiftCards(): void {
    if (this.searchQuery.trim() !== '') {
      this.kinguinService.searchGiftCards(this.searchQuery).subscribe((data: KinguinGiftCard[]) => {
        const giftCards = data.map(card => {
          card.coverImageOriginal = card.images.cover?.thumbnail || '';
          card.coverImage = card.images.cover?.thumbnail || '';
          return card;
        });
        this.searchResults.emit(giftCards);
        console.log('Search Results: ', giftCards);
      });
    }
  }
}
