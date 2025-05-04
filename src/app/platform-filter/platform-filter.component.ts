import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KinguinService } from '../kinguin-gift-cards/kinguin.service';
import { KinguinGiftCard } from '../kinguin-gift-cards/KinguinGiftCard';
import {
  CurrencyPipe,
  NgForOf,
  NgIf,
  NgStyle
} from '@angular/common';
import { firstValueFrom } from 'rxjs';
import {CurrencyService} from "../services/currency.service";
import {ConvertToHnlPipe} from "../pipes/convert-to-hnl.pipe";
import {DisplayPersistentDiscount} from "../pipes/calculate-displayed-discount.pipe";


@Component({
  selector: 'app-platform-filter',
  standalone: true,
  imports: [
    NgStyle,
    NgIf,
    CurrencyPipe,
    NgForOf,
    ConvertToHnlPipe,
    DisplayPersistentDiscount
  ],
  templateUrl: './platform-filter.component.html',
  styleUrls: ['./platform-filter.component.css']
})
export class PlatformFilterComponent implements OnInit {
  isLoading: boolean = false;
  isLoadingMore: boolean = false;
  errorMessage: string = '';
  searchResults: KinguinGiftCard[] = [];
  bannerImageUrl: string = '';
  bannerImageUrlBottom: string = '';
  platformName: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalLimit: number = 1000;
  hasMore: boolean = true;
  exchangeRate: number = 0;

  constructor(
    private currencyService: CurrencyService,
    private kinguinService: KinguinService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const platformParam = params.get('name');
      if (platformParam) {
        this.platformName = platformParam;

        this.currentPage = 1;
        this.loadPlatformCards(this.platformName, this.currentPage);
      }
    });

    this.fetchCurrencyExchange();
  }

  /**
   * Carga gift cards filtradas por plataforma con paginación.
   */
  async loadPlatformCards(platform: string, page: number): Promise<void> {
    const filters: any = {
      platform: platform,
      page: page,
      limit: this.pageSize
    };

    // Control de spinners
    if (page === 1) {
      this.isLoading = true;
    } else {
      this.isLoadingMore = true;
    }

    try {
      const giftCards = await firstValueFrom(
        this.kinguinService.getFilteredGiftCards(filters)
      );

      if (giftCards.length === 0 && page === 1) {
        console.warn(`No se encontraron productos para la plataforma: ${platform}`);
      }

      // Procesar cada card: asignar bestImage y discount
      const mappedGiftCards: KinguinGiftCard[] = [];
      for (const card of giftCards) {
        const bestImage = await this.getBestImageUrl(card);
        mappedGiftCards.push({
          ...card,
          coverImageOriginal: bestImage,
          randomDiscount: this.generatePersistentDiscount(card.name)
        });
      }

      if (page === 1) {
        this.searchResults = mappedGiftCards;
        this.setBannerImages();
      } else {
        this.searchResults = [...this.searchResults, ...mappedGiftCards];
      }

      const totalLoaded = this.searchResults.length;
      this.hasMore = totalLoaded < this.totalLimit && giftCards.length === this.pageSize;

      this.isLoading = false;
      this.isLoadingMore = false;
      this.errorMessage = '';
    } catch (error) {
      console.error('Error al obtener gift cards por plataforma:', error);
      if (page === 1) {
        this.searchResults = [];
      }
      this.isLoading = false;
      this.isLoadingMore = false;
      this.hasMore = false;
      this.errorMessage =
        'Hubo un error al cargar las gift cards. Por favor, intenta nuevamente más tarde.';
    }
  }

  /**
   * Cargar más resultados (siguiente página).
   */
  loadMore(): void {
    if (this.hasMore && !this.isLoadingMore) {
      this.currentPage++;
      this.loadPlatformCards(this.platformName, this.currentPage);
    }
  }

  /**
   * Determinar la mejor imagen (mayor resolución) para la gift card.
   */
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
    if (card.screenshots && card.screenshots.length > 0) {
      imageUrls.push(...card.screenshots.map(s => s.url));
    }

    const uniqueImageUrls = Array.from(new Set(imageUrls));
    const promises = uniqueImageUrls.map(url =>
      this.getImageResolution(url)
        .then(res => ({ url, resolution: res.width * res.height }))
        .catch(() => ({ url, resolution: 0 }))
    );

    const results = await Promise.all(promises);
    const validImages = results
      .filter(img => img.resolution > 0)
      .sort((a, b) => b.resolution - a.resolution);

    return validImages.length > 0 ? validImages[0].url : '';
  }

  /**
   * Obtiene la resolución de una imagen.
   */
  getImageResolution(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
    });
  }

  /**
   * Generar descuento pseudoaleatorio (15% a 40%) a partir del nombre.
   */
  generatePersistentDiscount(cardName: string): number {
    let hash = 0;
    for (let i = 0; i < cardName.length; i++) {
      hash = (hash << 5) - hash + cardName.charCodeAt(i);
      hash &= hash;
    }
    return Math.abs(hash % 26) + 15;
  }

  /**
   * Seleccionar 2 imágenes aleatorias para los banners superior e inferior
   * en la carga inicial (página 1).
   */
  setBannerImages(): void {
    if (this.searchResults.length > 0) {
      // Imagen aleatoria superior
      const randomIndexTop = Math.floor(Math.random() * this.searchResults.length);
      this.bannerImageUrl = this.searchResults[randomIndexTop].coverImageOriginal;

      // Imagen aleatoria inferior (distinta a la superior)
      let randomIndexBottom = Math.floor(Math.random() * this.searchResults.length);
      while (randomIndexBottom === randomIndexTop && this.searchResults.length > 1) {
        randomIndexBottom = Math.floor(Math.random() * this.searchResults.length);
      }
      this.bannerImageUrlBottom = this.searchResults[randomIndexBottom].coverImageOriginal;
    }
  }

  /**
   * Navegar a la vista de detalles de la gift card seleccionada.
   */
  viewDetails(card: KinguinGiftCard): void {
    this.router.navigate(['/gift-card-details', card.kinguinId])
      .then(success => {
        if (!success) {
          console.log('Fallo la navegación a detalles.');
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
