import { Component, EventEmitter, Output } from '@angular/core';
import { KinguinService } from "../kinguin.service";
import { KinguinGiftCard } from "../models/KinguinGiftCard";
import { FormsModule } from "@angular/forms";
import { NgClass, NgForOf } from "@angular/common";

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgClass
  ],
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css']
})
export class FiltersComponent {
  @Output() filteredResults = new EventEmitter<KinguinGiftCard[]>();
  @Output() filtersApplied = new EventEmitter<void>();

  isFilterOpen = false;
  isFilterVisible: boolean = false;
  showHighlightsAndRecommendations: boolean = true;

  filters = {
    hideOutOfStock: false,
    platform: '',
    region: '',
    priceRange: 50,
    os: '',
    genre: '',
    language: '',
    tags: ''
  };

  platforms = ['PC', 'PlayStation', 'Xbox'];
  regions = [
    { id: 1, name: 'Europe' },
    { id: 2, name: 'United States' },
    // más regiones...
  ];
  operatingSystems = ['Windows', 'Mac', 'Linux'];
  genres = ['Action', 'Adventure', 'RPG', 'Anime', 'Casual'];
  languages = ['English', 'Spanish', 'German'];
  tags = ['indie valley', 'dlc', 'base', 'software'];

  constructor(private kinguinService: KinguinService) {}

  ngOnInit(): void {}

  applyFilters(): void {
    this.kinguinService.getFilteredGiftCards(this.filters).subscribe(data => {
      const giftCards: KinguinGiftCard[] = data.map(card => {
        card.coverImageOriginal = card.images.cover?.thumbnail || '';
        card.coverImage = card.images.cover?.thumbnail || '';
        return card;
      });
      this.filteredResults.emit(giftCards); // Emisión de resultados filtrados
      console.log('Filtered Results: ', giftCards);

      // Emitir evento al padre cuando se aplican los filtros
      this.filtersApplied.emit();
      this.isFilterVisible = false;
    });
  }

  toggleFilter(): void {
    this.isFilterOpen = !this.isFilterOpen;
  }

  resetFilters(): void {
    // Resetear los filtros a sus valores por defecto
    this.filters = {
      hideOutOfStock: false,
      platform: '',
      region: '',
      priceRange: 50,
      os: '',
      genre: '',
      language: '',
      tags: ''
    };
    // Emitir los resultados filtrados vacíos o todos los giftCards
    this.kinguinService.getKinguinGiftCards(1).subscribe(data => {
      const giftCards: KinguinGiftCard[] = data.map(card => {
        card.coverImageOriginal = card.images.cover?.thumbnail || '';
        card.coverImage = card.images.cover?.thumbnail || '';
        return card;
      });
      this.filteredResults.emit(giftCards); // Emisión de todos los giftCards
      console.log('Filters reset. All gift cards loaded.');

      // Emitir evento al padre para indicar que los filtros fueron reseteados
      this.filtersApplied.emit();
      this.isFilterVisible = false;
    });
  }
}
