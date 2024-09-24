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
import {BackgroundAnimationService} from "../background-animation.service";
import {CurrencyService} from "../currency.service";

@Component({
  selector: 'app-kinguin-gift-cards',
  templateUrl: './kinguin-gift-cards.component.html',
  standalone: true,
  styleUrls: ['./kinguin-gift-cards.component.css'],
  imports: [CommonModule, PaginationComponent, FormsModule, SearchBarComponent, HighlightsComponent, RecommendationsComponent, FiltersComponent]
})
export class KinguinGiftCardsComponent implements OnInit {
  giftCards: KinguinGiftCard[] = [];
  displayedGiftCards: KinguinGiftCard[] = [];
  currentPage: number = 1;
  exchangeRate: number = 0;
  totalPages: number = 3309;
  itemsPerPage: number = 8; // Número de tarjetas por carga
  currentIndex: number = 0; // Índice para el 'Load More'
  totalItems: number = 8000;

  constructor(private kinguinService: KinguinService, private router: Router,  private currencyService: CurrencyService) { }

  ngOnInit(): void {
    // this.animation.initializeGraphAnimation();
    this.loadGiftCards(this.currentPage);
    this.fetchCurrencyExchange();
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
      this.displayedGiftCards = this.giftCards.slice(0, this.itemsPerPage)
      this.currentIndex = this.itemsPerPage;
    });
  }

  loadMore(): void {
    const nextItems = this.giftCards.slice(this.currentIndex, this.currentIndex + this.itemsPerPage);
    this.displayedGiftCards = [...this.displayedGiftCards, ...nextItems];
    this.currentIndex += this.itemsPerPage;
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

  fetchCurrencyExchange(): void {
    this.currencyService.getCurrency().subscribe(data => {
      this.exchangeRate = data['conversion_rate']
    });
  }
}
