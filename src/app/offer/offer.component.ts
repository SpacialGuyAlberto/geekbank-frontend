/* src/app/components/offer/offer.component.ts */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KinguinService } from '../kinguin.service';
import { KinguinGiftCard } from '../models/KinguinGiftCard';
import {NgForOf, NgIf, CurrencyPipe, NgClass, NgStyle} from '@angular/common';
import {Router} from "@angular/router";
@Component({
  selector: 'app-offer',
  templateUrl: './offer.component.html',
  standalone: true,
  imports: [NgIf, NgForOf, CurrencyPipe, NgClass, NgStyle],
  styleUrls: ['./offer.component.css']
})
export class OfferComponent implements OnInit {
  offerTitle: string = '';
  searchResults: KinguinGiftCard[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  bannerImageUrl: string = ''; // Imagen del banner superior
  bannerImageUrlBottom: string = ''; // Imagen del banner inferior

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private kinguinService: KinguinService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const titleParam = params.get('title');
      if (titleParam) {
        this.offerTitle = decodeURIComponent(titleParam);
        this.performSearch(this.offerTitle);
      }
    });
  }

  performSearch(query: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.kinguinService.searchGiftCards(query).subscribe(
      (data: KinguinGiftCard[]) => {
        this.searchResults = data.map(card => ({
          ...card,
          coverImageOriginal: card.coverImageOriginal || card.images.cover?.thumbnail || card.coverImage || '',
          randomDiscount: this.generatePersistentDiscount(card.name)
        }));
        this.isLoading = false;
        this.setBannerImages(); // Establecer ambas imágenes de banner
      },
      error => {
        console.error('Error al realizar la búsqueda:', error);
        this.errorMessage = 'Hubo un error al cargar los resultados. Por favor, inténtalo nuevamente.';
        this.isLoading = false;
      }
    );
  }

  generatePersistentDiscount(cardName: string): number {
    let hash = 0;
    for (let i = 0; i < cardName.length; i++) {
      hash = (hash << 5) - hash + cardName.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    const random = Math.abs(hash % 26) + 15; // Rango: [15, 40]
    return random;
  }

  setBannerImages(): void {
    if (this.searchResults.length > 0) {
      // Seleccionar una imagen aleatoria para el banner superior
      const randomIndexTop = Math.floor(Math.random() * this.searchResults.length);
      this.bannerImageUrl = this.searchResults[randomIndexTop].coverImageOriginal;

      // Seleccionar otra imagen aleatoria para el banner inferior
      let randomIndexBottom = Math.floor(Math.random() * this.searchResults.length);

      // Asegurarse de que las imágenes superior e inferior no sean la misma
      while (randomIndexBottom === randomIndexTop && this.searchResults.length > 1) {
        randomIndexBottom = Math.floor(Math.random() * this.searchResults.length);
      }
      this.bannerImageUrlBottom = this.searchResults[randomIndexBottom].coverImageOriginal;
    }
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
