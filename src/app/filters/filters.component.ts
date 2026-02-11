import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { KinguinService } from "../kinguin-gift-cards/kinguin.service";
import { KinguinGiftCard } from "../kinguin-gift-cards/KinguinGiftCard";
import { FormsModule } from "@angular/forms";
import { NgClass, NgForOf } from "@angular/common";
import {Subscription} from "rxjs";
import {SharedService} from "../services/shared.service";

@Component({
    selector: 'app-filters',
    imports: [
        FormsModule,
        NgForOf,
        NgClass
    ],
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.css']
})
export class FiltersComponent implements OnInit{
  @Output() filteredResults = new EventEmitter<KinguinGiftCard[]>();
  @Output() filtersApplied = new EventEmitter<void>();
  @Input() searchQuery : string = "";

  filterReseted: boolean = false;
  isFilterOpen = false;
  isFilterVisible: boolean = false;
  showHighlightsAndRecommendations: boolean = true;
  private searchQuerySubscription: Subscription | undefined;
  private isSearchModeSubscription: Subscription | undefined;

  filters = {
    hideOutOfStock: false,
    platform: '',
    region: '',
    priceRange: 50,
    os: '',
    genre: '',
    language: '',
    tags: '',
    name: ''
  };

  platforms = ['PC', 'PlayStation', 'Xbox'];
  regions = [
    { id: 1, name: 'Europe' },
    { id: 2, name: 'United States' },
    { id: 3, name: 'Region free' },
    { id: 4, name: 'Other' },
    { id: 5, name: 'Outside Europe' },
    { id: 6, name: 'RU VPN' },
    { id: 7, name: 'Russia' },
    { id: 8, name: 'United Kingdom' },
    { id: 9, name: 'China' },
    { id: 10, name: 'RoW (Rest of World)' },
    { id: 11, name: 'Latin America' },
    { id: 12, name: 'Asia' },
    { id: 13, name: 'Germany' },
    { id: 14, name: 'Australia' },
    { id: 15, name: 'Brazil' },
    { id: 16, name: 'India' },
    { id: 17, name: 'Japan' },
    { id: 18, name: 'North America' },
    { id: 45, name: 'Argentina' },
    { id: 46, name: 'Turkey' }
  ];

  operatingSystems = ['Windows', 'Mac', 'Linux'];
  genres = [
    'Action',
    'Adventure',
    'Anime',
    'Casual',
    'Co-op',
    'Dating Simulator',
    'Fighting',
    'FPS',
    'Hack and Slash',
    'Hidden Object',
    'Horror',
    'Indie',
    'Life Simulation',
    'MMO',
    'Music / Soundtrack',
    'Online Courses',
    'Open World',
    'Platformer',
    'Point & click',
    'PSN Card',
    'Puzzle',
    'Racing',
    'RPG',
    'Simulation',
    'Software',
    'Sport',
    'Story rich',
    'Strategy',
    'Subscription',
    'Survival',
    'Third-Person Shooter',
    'Visual Novel',
    'VR Games',
    'XBOX LIVE Gold Card',
    'XBOX LIVE Points'
  ];

  languages = ['English', 'Spanish', 'German'];
  tags = ['indie valley', 'dlc', 'base', 'software'];

  constructor(
    private kinguinService: KinguinService,
    private sharedService: SharedService
    ) {}

  ngOnInit(): void {
    this.searchQuerySubscription = this.sharedService.searchQuery$.subscribe( value => {
      this.searchQuery = value;
    });
    this.isSearchModeSubscription = this.sharedService.isSearchMode$.subscribe(value => {
      this.filterReseted = value;
    })
  }

  applyFilters(): void {

    this.filters.name = this.filterReseted ? "" : this.searchQuery.toLowerCase().trim();
    this.kinguinService.getFilteredGiftCards(this.filters).subscribe(data => {
      const giftCards: KinguinGiftCard[] = data.map(card => {
        card.coverImageOriginal = card.images.cover?.thumbnail || '';
        card.coverImage = card.images.cover?.thumbnail || '';
        return card;
      });
      this.filteredResults.emit(giftCards);

      this.filtersApplied.emit();
      this.isFilterVisible = false;
    });
  }

  toggleFilter(): void {
    this.isFilterOpen = !this.isFilterOpen;
  }

  toggleFilterReset(): void {
    this.filterReseted = !this.filterReseted;
  }

  resetFilters(): void {

    this.toggleFilterReset();

    this.filters = {
      hideOutOfStock: false,
      platform: '',
      region: '',
      priceRange: 50,
      os: '',
      genre: '',
      language: '',
      tags: '',
      name: ''
    };

    this.kinguinService.getKinguinGiftCards(1).subscribe(data => {
      const giftCards: KinguinGiftCard[] = data.map(card => {
        card.coverImageOriginal = card.images.cover?.thumbnail || '';
        card.coverImage = card.images.cover?.thumbnail || '';
        return card;
      });
      this.filteredResults.emit(giftCards);
      this.filtersApplied.emit();
      this.isFilterVisible = false;
    });
  }
}
