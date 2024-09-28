import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import { RouterModule } from '@angular/router';
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

  constructor(
    private backgroundAnimation: BackgroundAnimationService,
    private uiStateService: UIStateServiceService
  ) { }

  ngOnInit() {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;
    }

    this.uiStateService.showHighlights$.subscribe(show => {
      this.showHighlightsAndRecommendations = show;
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

}
