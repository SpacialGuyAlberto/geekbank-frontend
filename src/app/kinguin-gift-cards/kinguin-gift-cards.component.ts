import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { KinguinGiftCard } from "../models/KinguinGiftCard";
import { KinguinService } from "../kinguin.service";
import {PaginationComponent} from "../pagination/pagination.component";
import { Router } from '@angular/router';
import {FormsModule} from "@angular/forms";
import {SearchBarComponent} from "../search-bar/search-bar.component";
import {HighlightsComponent} from "../highlights/highlights.component";
import {RecommendationsComponent} from "../recommendations/recommendations.component";
import {FiltersComponent} from "../filters/filters.component";

@Component({
  selector: 'app-kinguin-gift-cards',
  templateUrl: './kinguin-gift-cards.component.html',
  standalone: true,
  styleUrls: ['./kinguin-gift-cards.component.css'],
  imports: [CommonModule, PaginationComponent, FormsModule, SearchBarComponent, HighlightsComponent, RecommendationsComponent, FiltersComponent]
})
export class KinguinGiftCardsComponent implements OnInit {
  giftCards: KinguinGiftCard[] = [];
  currentPage: number = 1;
  totalPages: number = 3309; // Assuming we know the total number of pages
  searchQuery: string = '';

  constructor(private kinguinService: KinguinService, private router: Router) { }

  ngOnInit(): void {
    this.loadGiftCards(this.currentPage);
  }

  loadGiftCards(page: number): void {
    this.kinguinService.getKinguinGiftCards(page).subscribe((data: KinguinGiftCard[]) => {
      this.giftCards = data.map(card => {
        // if (!card.coverImageOriginal || !card.coverImage) {
          card.coverImageOriginal = card.images.cover?.thumbnail || '';
          card.coverImage = card.images.cover?.thumbnail || '';
        // }
        return card;
      });
      console.log('Gift Cards: ', this.giftCards);
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadGiftCards(this.currentPage);
    }
  }

  viewDetails(card: KinguinGiftCard): void {
    console.log('CARD ID: ' + card.productId);
    this.router.navigate(['/gift-card-details', card.kinguinId]).then(success => {
      if (success) {
        console.log('Navigation successful');
      } else {
        console.log('Navigation failed');
      }
    });
  }

  handleSearchResults(results: KinguinGiftCard[]): void {
    this.giftCards = results;
    console.log('Search Results in Gift Cards Component: ', this.giftCards);
  }
}
