
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KinguinService } from '../kinguin-gift-cards/kinguin.service';
import { KinguinGiftCard } from '../kinguin-gift-cards/KinguinGiftCard';
import {NgForOf, NgIf, CurrencyPipe, NgClass, NgStyle} from '@angular/common';
import {Router} from "@angular/router";
import {ConvertToHnlPipe} from "../pipes/convert-to-hnl.pipe";
import {DisplayPersistentDiscount} from "../pipes/calculate-displayed-discount.pipe";
import {CurrencyService} from "../services/currency.service";

@Component({
    selector: 'app-offer',
    templateUrl: './offer.component.html',
    imports: [NgIf, NgForOf, CurrencyPipe, NgClass, NgStyle, ConvertToHnlPipe, DisplayPersistentDiscount],
    styleUrls: ['./offer.component.css']
})
export class OfferComponent implements OnInit {
  offerTitle: string = '';
  searchResults: KinguinGiftCard[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  bannerImageUrl: string = '';
  bannerImageUrlBottom: string = '';
  exchangeRate: number = 0;

  constructor(
    private currencyService: CurrencyService,
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
    this.fetchCurrencyExchange();
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
      const randomIndexTop = Math.floor(Math.random() * this.searchResults.length);
      this.bannerImageUrl = this.searchResults[randomIndexTop].coverImageOriginal;

      let randomIndexBottom = Math.floor(Math.random() * this.searchResults.length);

      while (randomIndexBottom === randomIndexTop && this.searchResults.length > 1) {
        randomIndexBottom = Math.floor(Math.random() * this.searchResults.length);
      }
      this.bannerImageUrlBottom = this.searchResults[randomIndexBottom].coverImageOriginal;
    }
  }
  viewDetails(card: KinguinGiftCard): void {

    this.router.navigate(['/gift-card-details', card.kinguinId]).then(success => {
      if (success) {

      } else {

      }
    });
  }

  fetchCurrencyExchange(): void {
    this.currencyService.getExchangeRateEURtoHNL(1).subscribe(
      (convertedAmount: number) => {
        this.exchangeRate = convertedAmount;
      }
    );
  }
}
