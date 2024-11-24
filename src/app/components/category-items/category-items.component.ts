import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { KinguinGiftCard } from '../../models/KinguinGiftCard';
import { KinguinService } from '../../kinguin.service';
import {CurrencyPipe, NgForOf, NgIf} from "@angular/common";
import {error} from "@angular/compiler-cli/src/transformers/util";

@Component({
  selector: 'app-category-items',
  templateUrl: './category-items.component.html',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    CurrencyPipe
  ],
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
    limit: 5
  };

  constructor(private kinguinService: KinguinService) {
  }
  ngOnInit(): void {
    this.loadGiftCards();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCategory'] && this.selectedCategory) {
      this.loadGiftCardsByGenre(this.selectedCategory);
    }
  }

  loadGiftCards(): void {
    if (!this.giftCards || this.giftCards.length === 0) {
      this.isLoading = false;
      return;
    }

    // Simulación de carga de datos progresiva
    let index = 0;
    const interval = setInterval(() => {
      if (index < this.giftCards.length) {
        this.displayedGiftCards.push(this.giftCards[index]);
        index++;
      } else {
        clearInterval(interval);
        this.isLoading = false;
      }
    }, 300); // Añade una tarjeta cada 300ms
  }


  loadGiftCardsByGenre(genre: string): void {
    const filters = {...this.defaultFilters, genre};

    this.kinguinService.getFilteredGiftCards(filters).subscribe(
      (giftCards) => {
        if (giftCards.length === 0) {
          console.warn(`No products found for genre: ${genre}`);
        }
        this.giftCards = giftCards.map(card => {
          card.coverImageOriginal = card.images.cover?.thumbnail || '';
          card.coverImage = card.images.cover?.thumbnail || '';
          return card;
        });

      },
      (error) => {
        console.error('Error fetching gift cards by genre:', error);
        this.giftCards = [];
      }
    );
  }

  viewDetails(card: any): void {
    // Lógica para ver los detalles de la tarjeta
    console.log('Ver detalles para:', card);
    // Puedes redirigir a otra ruta o abrir un modal con los detalles
  }


}
