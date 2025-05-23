import { Component, OnInit } from '@angular/core';
import {CurrencyPipe, NgClass, NgForOf, NgOptimizedImage} from "@angular/common";
import {KinguinGiftCard} from "../kinguin-gift-cards/KinguinGiftCard";
import {RecommendationsService} from "../services/recommendations.service";
import {NavigationEnd, Router} from "@angular/router";
import {AuthService} from "../services/auth.service";
import {filter} from "rxjs/operators";
import {ConvertToHnlPipe} from "../pipes/convert-to-hnl.pipe";
import {DisplayPersistentDiscount} from "../pipes/calculate-displayed-discount.pipe";
import {CurrencyService} from "../services/currency.service";

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [
    NgForOf,
    NgOptimizedImage,
    CurrencyPipe,
    NgClass,
    ConvertToHnlPipe,
    DisplayPersistentDiscount
  ],
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.css']
})
export class RecommendationsComponent implements OnInit {

  currentIndex = 0;
  giftCards: KinguinGiftCard[] = [];
  routeClass: string = '';
  exchangeRate: number = 0;
  constructor(
    private currencyService: CurrencyService,
    private recommendationsService: RecommendationsService,
    private router: Router,
    private authService: AuthService
              ) { }

  ngOnInit(): void {

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.setRouteClass(event.urlAfterRedirects);
      });

    const initialUrl = this.router.url;
    this.setRouteClass(initialUrl);
    const userId = this.getCurrentUserId();
    this.fetchRecommendations(userId)
    this.fetchCurrencyExchange();
  }

  fetchRecommendations(userId: number): void {
    const isLogged = this.isLoggedIn();
    if (isLogged) {
      this.recommendationsService.getRecommendationsByUser(userId)
        .subscribe(async (data: KinguinGiftCard[]) => {

            for (const card of data) {
              if (!card.coverImageOriginal) {
                card.coverImageOriginal = await this.getBestImageUrl(card);
              }
              card.randomDiscount = this.generatePersistentDiscount(card.name);
            }

            this.giftCards = data;
            this.startCarousel();
          },
          error => {
            console.error('Error al obtener las recomendaciones:', error);
          }
        );
    } else {
      this.recommendationsService.getMostPopular(4)
        .subscribe(async (data: KinguinGiftCard[]) => {

            for (const card of data) {
              if (!card.coverImageOriginal) {
                card.coverImageOriginal = await this.getBestImageUrl(card);
              }

              card.randomDiscount = this.generatePersistentDiscount(card.name);
            }

            this.giftCards = data;
            this.startCarousel();
          },
          error => {
            console.error('Error al obtener las más populares:', error);
          }
        );
    }
  }

  async getBestImageUrl(card: KinguinGiftCard): Promise<string> {
    const imageUrls: string[] = [];

    if (card.coverImageOriginal) {
      imageUrls.push(card.coverImageOriginal);
    }
    if (card.images.cover?.thumbnail) {
      imageUrls.push(card.images.cover.thumbnail);
    }

    if (card.coverImage) {
      imageUrls.push(card.coverImage);
    }

    if (card.images.screenshots && card.images.screenshots.length > 0){
      imageUrls.push(...card.images.screenshots.map(screenshot => screenshot.url))
    }

    if (card.screenshots && card.screenshots.length > 0) {
      imageUrls.push(...card.screenshots.map(screenshot => screenshot.url));
    }
    const uniqueImageUrls = Array.from(new Set(imageUrls));

    const promises = uniqueImageUrls.map(url =>
      this.getImageResolution(url)
        .then(res => ({
          url,
          resolution: res.width * res.height,
        }))
        .catch(err => {
          console.error(`Error al cargar la imagen ${url}:`, err);
          return { url, resolution: 0 }; // Considera 0 si falla
        })
    );

    const results = await Promise.all(promises);

    const validImages = results
      .filter(img => img.resolution > 0)
      .sort((a, b) => b.resolution - a.resolution);

    return validImages.length > 0 ? validImages[0].url : '';
  }

  getImageResolution(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
    });
  }


  setRouteClass(url: string): void {
    if (url.startsWith('/home')) {
      this.routeClass = 'home';
    } else if (url.startsWith('/cart')) {
      this.routeClass = 'cart';
    } else {
      this.routeClass = '';
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
    return 1;
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

    this.router.navigate(['/gift-card-details', card.kinguinId]).then(success => {
      if (success) {

      } else {

      }
    });
  }

  generatePersistentDiscount(cardName: string): number {
    // Crea un "hash" simple basado en el nombre de la tarjeta
    let hash = 0;
    for (let i = 0; i < cardName.length; i++) {
      hash = (hash << 5) - hash + cardName.charCodeAt(i);
      hash = hash & hash; // Convertir a 32 bits
    }

    const random = Math.abs(hash % 26) + 15;
    return random;
  }

  fetchCurrencyExchange(): void {
    this.currencyService.getExchangeRateEURtoHNL(1).subscribe(
      (convertedAmount: number) => {
        this.exchangeRate = convertedAmount;
      }
    );
  }
}

