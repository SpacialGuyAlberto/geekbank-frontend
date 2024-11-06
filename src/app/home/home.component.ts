import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HomeService } from "../home.service";
import { FreeFireGiftCardComponent } from "../free-fire-gift-card/free-fire-gift-card.component";
import { KinguinGiftCardsComponent } from "../kinguin-gift-cards/kinguin-gift-cards.component";
import { NgModel } from "@angular/forms";
import { HighlightsComponent } from '../highlights/highlights.component';
import { RecommendationsComponent } from "../recommendations/recommendations.component";
import { FiltersComponent } from "../filters/filters.component";
import { BackgroundAnimationService } from "../background-animation.service";
import { UIStateServiceService } from "../uistate-service.service";
import { Subscription } from "rxjs";
import { KinguinGiftCard } from "../models/KinguinGiftCard";
import { KinguinService } from '../kinguin.service';
import { GiftCard } from "../models/GiftCard";
import { BannerComponent } from "../banner/banner.component";
import { OffersBannerComponent } from "../offers-banner/offers-banner.component";

@Component({
  selector: 'app-home',
  standalone: true,
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
    OffersBannerComponent
  ]
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  username: string = '';
  showHighlightsAndRecommendations: boolean = true;
  showFreeFireComponent: boolean = true;
  existingAccountsData: GiftCard[] = [];
  giftCard: GiftCard | null = null;
  newAccountsData: KinguinGiftCard[] = [];
  isSmallScreen: boolean = false;
  isSearching: boolean = false;
  isFilterVisible: boolean = false;
  uiStateSubscription!: Subscription;
  searchQuery: string = '';
  searchResults: KinguinGiftCard[] = [];

  // Propiedades para manejar los resultados filtrados
  filteredGiftCards: KinguinGiftCard[] = [];
  hasFilteredResults: boolean = false;
  currentGiftCards: KinguinGiftCard[] | null = null; // Nueva propiedad

  constructor(
    private uiStateService: UIStateServiceService,
    private route: ActivatedRoute,
    private kinguinService: KinguinService
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

    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery = params['search'];
        this.executeSearch();
      }
    });
  }

  ngAfterViewInit(): void {
    // Implementa cualquier lógica adicional después de la inicialización de la vista
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
  }

  checkScreenSize() {
    this.isSmallScreen = window.innerWidth <= 768;
  }

  openFilterModal() {
    this.isFilterVisible = true;
  }

  // Cierra el modal de filtros
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
    this.showHighlightsAndRecommendations = true; // Opcional: Mostrar de nuevo los destacados
    console.log('Filters reset.');
  }

  /**
   * Ejecuta la búsqueda basada en la consulta de búsqueda
   */
  executeSearch() {
    if (this.searchQuery.trim() !== '') {
      const queryLower = this.searchQuery.toLowerCase();
      if (
        queryLower.includes('free fire') ||
        queryLower.includes('free fair') ||
        queryLower.includes('freefire') // Añadido 'freefire' como otra variación
      ) {
        // Mostrar componente Free Fire
        this.showFreeFireComponent = true;
        console.log('Rendering free fire component')
        this.showHighlightsAndRecommendations = false;
      } else {
        // Búsqueda normal
        this.showFreeFireComponent = false;
        this.kinguinService
          .searchGiftCards(this.searchQuery)
          .subscribe((data: KinguinGiftCard[]) => {
            this.searchResults = data;
            this.showHighlightsAndRecommendations = false;
          });
      }
    }
  }
}
