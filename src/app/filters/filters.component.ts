import {Component, EventEmitter, Output} from '@angular/core';
import {KinguinService} from "../kinguin.service";
import {KinguinGiftCard} from "../models/KinguinGiftCard";
import {FormsModule} from "@angular/forms";
import {NgClass, NgForOf} from "@angular/common";

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgClass
  ],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css'
})
export class FiltersComponent {
  @Output() filteredResults = new EventEmitter<KinguinGiftCard[]>();
  isFilterOpen = false;

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
  genres = ['Action', 'Adventure', 'RPG'];
  languages = ['English', 'Spanish', 'German'];
  tags = ['indie valley', 'dlc', 'base'];

  constructor(private kinguinService: KinguinService) {}

  ngOnInit(): void {}

  applyFilters(): void {
    this.kinguinService.getFilteredGiftCards(this.filters).subscribe(data => {
      const giftCards: KinguinGiftCard[] = data.map(card => {
        card.coverImageOriginal = card.images.cover?.thumbnail || '';
        card.coverImage = card.images.cover?.thumbnail || '';
        return card;
      });
      this.filteredResults.emit(giftCards)
      console.log('Filtered Results: ', giftCards);
    });
  }

  toggleFilter(): void {
    this.isFilterOpen = !this.isFilterOpen;
  }
}
