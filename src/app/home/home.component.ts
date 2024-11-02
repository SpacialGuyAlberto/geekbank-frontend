import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, RouterModule} from '@angular/router';
import { CommonModule } from '@angular/common';
import {HomeService} from "../home.service";
import {FreeFireGiftCardComponent} from "../free-fire-gift-card/free-fire-gift-card.component";
import {KinguinGiftCardsComponent} from "../kinguin-gift-cards/kinguin-gift-cards.component";
import {NgModel} from "@angular/forms";
import { HighlightsComponent } from '../highlights/highlights.component'; // Importa el componente
import {RecommendationsComponent} from "../recommendations/recommendations.component";
import {FiltersComponent} from "../filters/filters.component";
import {BackgroundAnimationService} from "../background-animation.service";
import {UIStateServiceService} from "../uistate-service.service";
import {Subscription} from "rxjs";
import {KinguinGiftCard} from "../models/KinguinGiftCard";
import { KinguinService } from '../kinguin.service';
import {GiftCard} from "../models/GiftCard";
import {BannerComponent} from "../banner/banner.component";

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
    BannerComponent
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

  constructor(
    // private backgroundAnimation: BackgroundAnimationService,
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
    // this.backgroundAnimation.initializeGraphAnimation();
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
  closeFilterModal() {
    this.isFilterVisible = false;
  }


  // executeSearch() {
  //   if (this.searchQuery.trim() !== '') {
  //     console.log('true')
  //     this.kinguinService.searchGiftCards(this.searchQuery).subscribe((data: KinguinGiftCard[]) => {
  //       this.searchResults = data;
  //     });
  //   }
  // }

  executeSearch() {
    if (this.searchQuery.trim() !== '') {
      const queryLower = this.searchQuery.toLowerCase();
      if (
        queryLower.includes('free fire') ||
        queryLower.includes('free fair') ||
        queryLower.includes('freefire') // Added 'freefire' as another variation
      ) {
        // Show Free Fire component
        this.showFreeFireComponent = true;
        console.log('Rendering free fire component')
        this.showHighlightsAndRecommendations = false;
      } else {
        // Normal search
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
