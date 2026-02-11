// src/app/components/category-items/category-items.component.ts
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { KinguinGiftCard } from '../../kinguin-gift-cards/KinguinGiftCard';
import { KinguinService } from '../../kinguin-gift-cards/kinguin.service';
import { CurrencyPipe, NgForOf, NgIf } from "@angular/common";
import { RouterLink } from '@angular/router';
import {Router} from "@angular/router";

@Component({
    selector: 'app-category-items',
    imports: [
        NgForOf,
        NgIf,
        CurrencyPipe,
        RouterLink
    ],
    templateUrl: './category-items.component.html',
    styleUrls: ['./category-items.component.css']
})
export class CategoryItemsComponent implements OnInit, OnChanges {
  @Input() selectedCategory: string | null = null;
  giftCards: KinguinGiftCard[] = [];
  displayedGiftCards: KinguinGiftCard[] = [];
  isLoading: boolean = true;

  defaultFilters = {
    hideOutOfStock: false,
    platform: '',
    region: '',
    priceRange: undefined,
    os: '',
    genre: '',
    language: '',
    tags: '',
    page: 1,
    limit: 5 // Límite para mostrar una cantidad reducida
  };

  constructor(private kinguinService: KinguinService, private router: Router) {}

  ngOnInit(): void {
    this.loadGiftCards();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCategory'] && this.selectedCategory) {
      this.loadGiftCardsByGenre(this.selectedCategory);
    }
  }

  loadGiftCards(): void {
    this.kinguinService.getFilteredGiftCards(this.defaultFilters).subscribe(
      (giftCards) => {
        this.giftCards = giftCards.map(card => ({
          ...card,
          coverImageOriginal: card.images.cover?.thumbnail || '',
          coverImage: card.images.cover?.thumbnail || ''
        }));
        this.displayedGiftCards = this.giftCards.slice(0, this.defaultFilters.limit);
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching gift cards:', error);
        this.giftCards = [];
        this.displayedGiftCards = [];
        this.isLoading = false;
      }
    );
  }

  loadGiftCardsByGenre(genre: string): void {
    const filters = { ...this.defaultFilters, genre };

    this.isLoading = true;
    this.kinguinService.getFilteredGiftCards(filters).subscribe(
      (giftCards) => {
        if (giftCards.length === 0) {
          console.warn(`No products found for genre: ${genre}`);
        }
        this.giftCards = giftCards.map(card => ({
          ...card,
          coverImageOriginal: card.images.cover?.thumbnail || '',
          coverImage: card.images.cover?.thumbnail || ''
        }));
        this.displayedGiftCards = this.giftCards.slice(0, this.defaultFilters.limit);
        this.isLoading = false;
      },
      (error) => {

        this.giftCards = [];
        this.displayedGiftCards = [];
        this.isLoading = false;
      }
    );
  }

  viewDetails(card: KinguinGiftCard): void {

    this.router.navigate(['/gift-card-details', card.kinguinId]).then(success => {
      if (success) {

      } else {

      }
    });
  }
}
