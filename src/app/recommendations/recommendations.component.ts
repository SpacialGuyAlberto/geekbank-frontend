import { Component, OnInit } from '@angular/core';
import {CurrencyPipe, NgClass, NgForOf, NgOptimizedImage} from "@angular/common";
import {KinguinGiftCard} from "../models/KinguinGiftCard";
import {RecommendationsService} from "../services/recommendations.service";
import {NavigationEnd, Router} from "@angular/router";
import {AuthService} from "../auth.service";
import {filter} from "rxjs/operators";


@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [
    NgForOf,
    NgOptimizedImage,
    CurrencyPipe,
    NgClass
  ],
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.css']
})
export class RecommendationsComponent implements OnInit {

  currentIndex = 0;
  giftCards: KinguinGiftCard[] = [];
  routeClass: string = '';
  constructor(private recommendationsService: RecommendationsService,
              private router: Router,
              private authService: AuthService
              ) { }

  ngOnInit(): void {

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.setRouteClass(event.urlAfterRedirects);
      });

    // Asignar la clase de ruta inicial
    const initialUrl = this.router.url;
    this.setRouteClass(initialUrl);
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
            card.randomDiscount = this.generatePersistentDiscount(card.name);
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
          card.randomDiscount = this.generatePersistentDiscount(card.name);
          return card;
        });
        this.startCarousel();
      }))
    }
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

  generatePersistentDiscount(cardName: string): number {
    // Crea un "hash" simple basado en el nombre de la tarjeta
    let hash = 0;
    for (let i = 0; i < cardName.length; i++) {
      hash = (hash << 5) - hash + cardName.charCodeAt(i);
      hash = hash & hash; // Convertir a 32 bits
    }

    // Genera un número aleatorio consistente entre 15 y 40 basado en el hash
    const random = Math.abs(hash % 26) + 15; // Rango: [15, 40]
    return random;
  }
}

