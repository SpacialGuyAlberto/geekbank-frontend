import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KinguinService } from '../kinguin.service';
import { KinguinGiftCard } from '../models/KinguinGiftCard';
import {
  CurrencyPipe,
  NgForOf,
  NgIf,
  NgStyle
} from '@angular/common';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-platform-filter',
  standalone: true,
  imports: [
    NgStyle,
    NgIf,
    CurrencyPipe,
    NgForOf
  ],
  templateUrl: './platform-filter.component.html',
  styleUrls: ['./platform-filter.component.css']
})
export class PlatformFilterComponent implements OnInit {
  // Variables de estado
  isLoading: boolean = false;       // Carga inicial (página 1)
  isLoadingMore: boolean = false;   // Carga adicional (página > 1)
  errorMessage: string = '';

  // Arreglo donde se guardan los resultados filtrados
  searchResults: KinguinGiftCard[] = [];

  // Variables para el banner superior e inferior
  bannerImageUrl: string = '';
  bannerImageUrlBottom: string = '';

  // Parámetro de la ruta (plataforma)
  platformName: string = '';

  // Paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalLimit: number = 1000;
  hasMore: boolean = true;

  constructor(
    private kinguinService: KinguinService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Leer el parámetro de plataforma desde la ruta: /platform/:name
    this.route.paramMap.subscribe(params => {
      const platformParam = params.get('name');
      if (platformParam) {
        this.platformName = platformParam;

        // Carga inicial: página 1
        this.currentPage = 1;
        this.loadPlatformCards(this.platformName, this.currentPage);
      }
    });
  }

  /**
   * Carga gift cards filtradas por plataforma con paginación.
   */
  async loadPlatformCards(platform: string, page: number): Promise<void> {
    // Preparar el objeto de filtros
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
      // Llamada al servicio con firstValueFrom para usar async/await
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

      // Si es primera página, reemplazamos; si no, concatenamos
      if (page === 1) {
        this.searchResults = mappedGiftCards;
        // Establecer banners SOLO en la carga inicial
        this.setBannerImages();
      } else {
        this.searchResults = [...this.searchResults, ...mappedGiftCards];
      }

      // Determinar si hay más
      // Mientras se traiga 'pageSize' elementos, presumimos que hay más
      // y también limitamos a un total de 'totalLimit'
      const totalLoaded = this.searchResults.length;
      this.hasMore = totalLoaded < this.totalLimit && giftCards.length === this.pageSize;

      // Finalizar spinners
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
   * Obtiene la “mejor” imagen disponible para la gift card.
   * (Similar a la lógica en filtered-page.component)
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
   * Auxiliar para checar la resolución de una imagen.
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
   * Generar descuento pseudoaleatorio en base al nombre de la tarjeta.
   */
  generatePersistentDiscount(cardName: string): number {
    let hash = 0;
    for (let i = 0; i < cardName.length; i++) {
      hash = (hash << 5) - hash + cardName.charCodeAt(i);
      hash &= hash;
    }
    // Devuelve un rango entre 15 y 40.
    return Math.abs(hash % 26) + 15;
  }

  /**
   * Selecciona 2 imágenes aleatorias para los banners superior e inferior.
   * Se llama solo en la carga inicial (página 1).
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
   * Navega a la vista de detalles de la gift card seleccionada.
   */
  viewDetails(card: KinguinGiftCard): void {
    this.router.navigate(['/gift-card-details', card.kinguinId])
      .then(success => {
        if (!success) {
          console.log('Fallo la navegación a detalles.');
        }
      });
  }
}
