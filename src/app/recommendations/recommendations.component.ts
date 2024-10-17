import { Component, OnInit } from '@angular/core';
import {CurrencyPipe, NgForOf, NgOptimizedImage} from "@angular/common";
import {KinguinGiftCard} from "../models/KinguinGiftCard";
import {RecommendationsService} from "../services/recommendations.service";
import {Router} from "@angular/router";

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

  constructor(private recommendationsService: RecommendationsService,  private router: Router,) { }

  ngOnInit(): void {
    const userId = this.getCurrentUserId(); // Implementa este método
    this.recommendationsService.getRecommendationsByUser(userId).subscribe(
      (data: KinguinGiftCard[]) => {
        this.giftCards = data;
        this.startCarousel();
      },
      error => {
        console.error('Error al obtener las recomendaciones:', error);
      }
    );
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

