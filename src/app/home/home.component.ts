import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HomeService } from "./home.service";
import { FreeFireGiftCardComponent } from "../free-fire-gift-card/free-fire-gift-card.component";
import { KinguinGiftCardsComponent } from "../kinguin-gift-cards/kinguin-gift-cards.component";
import { NgModel } from "@angular/forms";
import { HighlightsComponent } from '../highlights/highlights.component';
import { RecommendationsComponent } from "../recommendations/recommendations.component";
import { FiltersComponent } from "../filters/filters.component";
import { BackgroundAnimationService } from "../services/background-animation.service";
import { UIStateServiceService } from "../services/uistate-service.service";
import { Subscription } from "rxjs";
import { KinguinGiftCard } from "../kinguin-gift-cards/KinguinGiftCard";
import { KinguinService } from '../kinguin-gift-cards/kinguin.service';
import { GiftCard } from "../models/GiftCard";
import { BannerComponent } from "../banner/banner.component";
import { OffersBannerComponent } from "../offers-banner/offers-banner.component";
import { SearchStateService } from "../services/search-state.service";
import { InferiorFilterComponent } from "../inferior-filter/inferior-filter.component";
import { FlashSaleComponent } from "../flash-sale/flash-sale.component";
import { CombosComponent } from '../combos/combos.component';


@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    imports: [
        RouterModule,
        CommonModule,
        FreeFireGiftCardComponent,
        KinguinGiftCardsComponent,
        HighlightsComponent,
        RecommendationsComponent,
        FiltersComponent,
        BannerComponent,
        OffersBannerComponent,
        InferiorFilterComponent,
        FlashSaleComponent,
        CombosComponent
    ]
})
export class HomeComponent implements OnInit, OnDestroy {
  showFreeFireComponent: boolean = false;
  username: string = '';
  showHighlightsAndRecommendations: boolean = true;
  giftCard: GiftCard | null = null;
  isSmallScreen: boolean = false;
  isFilterVisible: boolean = false;
  uiStateSubscription!: Subscription;
  searchQuery: string = '';
  searchResults: KinguinGiftCard[] = [];

  filteredGiftCards: KinguinGiftCard[] = [];
  hasFilteredResults: boolean = false;
  currentGiftCards: KinguinGiftCard[] | null = null;
  private searchSubscription!: Subscription;

  constructor(
    private uiStateService: UIStateServiceService,
    private route: ActivatedRoute,
    private kinguinService: KinguinService,
    private searchStateService: SearchStateService
  ) { }

  ngOnInit() {
    const storedUsername = localStorage.getItem('username');
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));

    if (storedUsername) {
      this.username = storedUsername;
    }

    this.uiStateService.showHighlights$.subscribe(show => {
      this.showHighlightsAndRecommendations = show;
    });

    this.searchSubscription = this.searchStateService.isFreeFireSearch$
      .subscribe(isFreeFire => {
        this.showFreeFireComponent = isFreeFire;

      });

    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery = params['search'];
        this.executeSearch();
      }
    });
  }

  toggleFilter() {
    this.isFilterVisible = !this.isFilterVisible;
  }

  applyFilters() {
    this.isFilterVisible = false;
    this.showHighlightsAndRecommendations = false;
  }

  ngOnDestroy(): void {
    if (this.uiStateSubscription) {
      this.uiStateSubscription.unsubscribe();
    }
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  checkScreenSize() {
    this.isSmallScreen = window.innerWidth <= 768;
  }

  openFilterModal() {
    this.isFilterVisible = true;
  }

  isLoading: boolean = false;
  closeFilterModal() {
    this.isFilterVisible = false;
  }

  /**
   * Maneja los resultados filtrados emitidos por FiltersComponent
   * @param filteredResults Array de KinguinGiftCard filtradas
   */
  handleFilteredResults(filteredResults: KinguinGiftCard[]): void {
    this.filteredGiftCards = filteredResults;
    this.hasFilteredResults = filteredResults.length > 0;
    this.currentGiftCards = filteredResults.length > 0 ? filteredResults : null;
    console.log('Received filtered results: ', this.filteredGiftCards);
  }

  /**
   * Método para resetear los filtros y mostrar las tarjetas predeterminadas
   */
  resetFilters(): void {
    this.filteredGiftCards = [];
    this.hasFilteredResults = false;
    this.currentGiftCards = null;
    this.showHighlightsAndRecommendations = true;
    console.log('Filters reset.');
  }

  executeSearch() {
    if (this.searchQuery.trim() !== '') {
      const queryLower = this.searchQuery.toLowerCase();
      if (
        queryLower.includes('free fire') ||
        queryLower.includes('free fair') ||
        queryLower.includes('freefire')
      ) {
        this.showFreeFireComponent = true;
        this.showHighlightsAndRecommendations = false;
        this.currentGiftCards = [];
      } else {
        this.showFreeFireComponent = false;
        this.kinguinService.searchGiftCards(this.searchQuery)
          .subscribe((data: KinguinGiftCard[]) => {
            this.searchResults = data;
            this.currentGiftCards = data;
            this.showHighlightsAndRecommendations = false;
          });
      }
    }
  }

}
