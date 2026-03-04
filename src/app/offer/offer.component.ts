
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KinguinService } from '../kinguin-gift-cards/kinguin.service';
import { KinguinGiftCard } from '../kinguin-gift-cards/KinguinGiftCard';
import { NgForOf, NgIf, CurrencyPipe, NgClass, NgStyle } from '@angular/common';
import { Router } from "@angular/router";
import { ConvertToHnlPipe } from "../pipes/convert-to-hnl.pipe";
import { DisplayPersistentDiscount } from "../pipes/calculate-displayed-discount.pipe";
import { CurrencyService } from "../services/currency.service";

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
  isWarStyle: boolean = false;

  constructor(
    private currencyService: CurrencyService,
    private router: Router,
    private route: ActivatedRoute,
    private kinguinService: KinguinService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const titleParam = params.get('title');
      if (titleParam) {
        // Handle potential multiple encodings (e.g., %252520)
        let decodedTitle = titleParam;
        let previousTitle = '';
        while (decodedTitle !== previousTitle && decodedTitle.includes('%')) {
          previousTitle = decodedTitle;
          try {
            decodedTitle = decodeURIComponent(decodedTitle);
          } catch (e) {
            break;
          }
        }

        this.offerTitle = decodedTitle;
        this.isWarStyle = this.offerTitle.toLowerCase().includes('call of duty');
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
    if (this.isWarStyle) {
      this.playGunshotSound();
    }
    this.router.navigate(['/gift-card-details', card.kinguinId]);
  }

  private playGunshotSound(): void {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;

      // 1. EXPLOSION NOISE (The "Pure" Bang)
      const bufferSize = audioCtx.sampleRate * 0.15;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(4000, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.1);

      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noise.start(now);
      noise.stop(now + 0.15);

      // 2. THE PUNCH (Low-end body)
      const punch = audioCtx.createOscillator();
      const punchGain = audioCtx.createGain();
      punch.type = 'sine';
      punch.frequency.setValueAtTime(180, now);
      punch.frequency.exponentialRampToValueAtTime(40, now + 0.08);

      punchGain.gain.setValueAtTime(0.3, now);
      punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      punch.connect(punchGain);
      punchGain.connect(audioCtx.destination);
      punch.start(now);
      punch.stop(now + 0.08);

      // 3. MECHANICAL SNAP (Initial trigger)
      const snap = audioCtx.createOscillator();
      const snapGain = audioCtx.createGain();
      snap.type = 'square';
      snap.frequency.setValueAtTime(1600, now);
      snapGain.gain.setValueAtTime(0.15, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
      snap.connect(snapGain);
      snapGain.connect(audioCtx.destination);
      snap.start(now);
      snap.stop(now + 0.015);

    } catch (e) {
      console.error('Gunshot synthesis failed', e);
    }
  }

  fetchCurrencyExchange(): void {
    this.currencyService.getExchangeRateEURtoHNL(1).subscribe(
      (convertedAmount: number) => {
        this.exchangeRate = convertedAmount;
      }
    );
  }
}
