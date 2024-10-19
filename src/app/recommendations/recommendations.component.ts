import { Component, OnInit } from '@angular/core';
import {CurrencyPipe, NgForOf, NgOptimizedImage} from "@angular/common";
import {KinguinGiftCard} from "../models/KinguinGiftCard";
import {RecommendationsService} from "../services/recommendations.service";
import {Router} from "@angular/router";
import {AuthService} from "../auth.service";


@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [
    NgForOf,
    NgOptimizedImage,
    CurrencyPipe
  ],
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.css']
})
export class RecommendationsComponent implements OnInit {

  currentIndex = 0;
  giftCards: KinguinGiftCard[] = [];

  constructor(private recommendationsService: RecommendationsService,
              private router: Router,
              private authService: AuthService
              ) { }

  ngOnInit(): void {
    const userId = this.getCurrentUserId(); // Implementa este método
    this.fetchRecommendations(userId)
  }

  fetchRecommendations(userId : number) : void {
    const isLogged = this.isLoggedIn();
    if (isLogged){
      this.recommendationsService.getRecommendationsByUser(userId).subscribe(
        (data: KinguinGiftCard[]) => {
          this.giftCards = data.map(card => {
            card.coverImageOriginal = card.images.cover?.thumbnail || '';
            card.coverImage = card.images.cover?.thumbnail || '';
            return card;
          });
          this.startCarousel();
        },
        error => {
          console.error('Error al obtener las recomendaciones:', error);
        }
      );
    } else {
      this.recommendationsService.getMostPopular(4).subscribe( (data => {
        this.giftCards = data.map(card => {
          card.coverImageOriginal = card.images.cover?.thumbnail || '';
          card.coverImage = card.images.cover?.thumbnail || '';
          return card;
        });
        this.startCarousel();
      }))
    }
  }

  getCurrentUserId(): number {
    const userIdStr = sessionStorage.getItem('userId');
    if (userIdStr !== null) {
      const userId = parseInt(userIdStr);
      if (!isNaN(userId)) {
        return userId;
      }
    }
    return 1; // Valor por defecto si no se puede obtener el userId
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  startCarousel(): void {
    if (this.giftCards.length > 0) {
      setInterval(() => {
        this.moveToNextSlide();
      }, 3000);
    }
  }

  moveToNextSlide(): void {
    const track = document.querySelector('.carousel-track') as HTMLElement;
    const slides = document.querySelectorAll('.highlight-card') as NodeListOf<HTMLElement>;

    if (slides.length === 0 || !track) {
      return;
    }

    this.currentIndex = (this.currentIndex + 1) % slides.length;
    const amountToMove = -track.clientWidth * this.currentIndex;

    track.style.transform = `translateX(${amountToMove}px)`;
  }

  viewDetails(card: KinguinGiftCard): void {
    console.log('CARD ID: ' + card.productId);
    this.router.navigate(['/gift-card-details', card.kinguinId]).then(success => {
      if (success) {
        console.log('Navigation successful');
      } else {
        console.log('Navigation failed');
      }
    });
  }
}

