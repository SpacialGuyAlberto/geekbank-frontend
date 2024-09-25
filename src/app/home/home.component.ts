import {AfterViewInit, Component, OnInit} from '@angular/core';
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

interface onInit {
}

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
// export class HomeComponent implements onInit {
//   username: string = '';
//   homeData: any;
//   errorMessage: string = '';
//
//   constructor(private homeService: HomeService) {}
//
//   ngOnInit() {
//     const storedUsername = localStorage.getItem('username');
//
//     if (storedUsername) {
//       this.username = storedUsername;
//     }
//     this.loadHomeData();
//   }
//   loadHomeData(): void {
//     this.homeService.getHomeData().subscribe(
//       data => {
//         this.homeData = data;
//       },
//       error => {
//         if (error.status === 401) {
//           this.errorMessage = error.error.error;
//         } else {
//           this.errorMessage = 'Error fetching home data';
//         }
//         console.error('Error fetching home data', error);
//       }
//     );
//   }
//
// }
export class HomeComponent implements OnInit, AfterViewInit {
  username: string = '';
  showHighlightsAndRecommendations: boolean = true;
  isSearching: boolean = false;
  isFilterVisible: boolean = false;

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
    // Inicializar la animación del canvas después de que se cargue la vista
    this.backgroundAnimation.initializeGraphAnimation();
  }

  toggleFilter() {
    this.isFilterVisible = !this.isFilterVisible;
  }
  applyFilters() {
    this.isFilterVisible = false;
    // Aquí puedes agregar lógica adicional si es necesario al aplicar los filtros
  }

}


