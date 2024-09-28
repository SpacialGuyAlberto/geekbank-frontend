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
    FiltersComponent
  ]
})

export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  username: string = '';
  showHighlightsAndRecommendations: boolean = true;
  isSearching: boolean = false;
  isFilterVisible: boolean = false;
  private uiStateSubscription!: Subscription;
  searchQuery: string = '';
  searchResults: KinguinGiftCard[] = [];

  constructor(
    private backgroundAnimation: BackgroundAnimationService,
    private uiStateService: UIStateServiceService,
    private route: ActivatedRoute,
    private kinguinService: KinguinService
  ) { }

  ngOnInit() {
    const storedUsername = localStorage.getItem('username');
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
    this.backgroundAnimation.initializeGraphAnimation();
  }

  toggleFilter() {
    this.isFilterVisible = !this.isFilterVisible;
  }
  applyFilters() {
    this.isFilterVisible = false;
  }

  ngOnDestroy(): void {
    if (this.uiStateSubscription) {
      this.uiStateSubscription.unsubscribe();
    }
  }

  executeSearch() {
    if (this.searchQuery.trim() !== '') {
      this.kinguinService.searchGiftCards(this.searchQuery).subscribe((data: KinguinGiftCard[]) => {
        this.searchResults = data;
      });
    }
  }

}
