// src/app/components/filtered-page/filtered-page.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KinguinGiftCard } from "../models/KinguinGiftCard";
import { KinguinService } from "../kinguin.service";
import { CurrencyPipe, CommonModule, NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryItemsComponent } from "../components/category-items/category-items.component";
import {Router} from "@angular/router";
import {firstValueFrom} from "rxjs";


@Component({
  selector: 'app-filtered-page',
  standalone: true,
  imports: [
    CommonModule,
    NgForOf,
    NgIf,
    CurrencyPipe,
    RouterLink,
    CategoryItemsComponent
  ],
  templateUrl: './filtered-page.component.html',
  styleUrls: ['./filtered-page.component.css']
})
export class FilteredPageComponent implements OnInit {
  selectedCategory: string | null = null;
  giftCards: KinguinGiftCard[] = [];
  isLoading: boolean = true;
  isLoadingMore: boolean = false;
  currentPage: number = 1;
  pageSize: number = 10; // Cargar 50 por página
  totalLimit: number = 1000; // Límite total de gift cards
  hasMore: boolean = true; // Indica si hay más gift cards para cargar
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private kinguinService: KinguinService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.selectedCategory = params.get('category');
      if (this.selectedCategory) {
        this.loadGiftCardsByCategory(this.selectedCategory, this.currentPage);
      } else {
        this.isLoading = false;
      }
    });
  }

  // Función para limpiar los filtros, eliminando parámetros vacíos o undefined
  private cleanFilters(filters: any): any {
    return Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
    );
  }

  async loadGiftCardsByCategory(category: string, page: number): Promise<void> {
    let filters = {
      hideOutOfStock: false,
      genre: category,
      page: page,
      limit: this.pageSize,
      platform: '',
      region: '',
      os: '',
      language: '',
      tags: '',
      priceRange: undefined // Si tienes filtros adicionales, inclúyelos aquí
    };

    // Limpiar los filtros para eliminar parámetros vacíos
    filters = this.cleanFilters(filters);

    // Actualizar los estados de carga
    if (page === 1) {
      this.isLoading = true;
    } else {
      this.isLoadingMore = true;
    }

    try {
      const giftCards = await firstValueFrom(this.kinguinService.getFilteredGiftCards(filters));

      if (giftCards.length === 0 && page === 1) {
        console.warn(`No se encontraron productos para la categoría: ${category}`);
      }

      const mappedGiftCards = [];
      for (const card of giftCards) {
        const bestImage = await this.getBestImageUrl(card); // Usar la mejor imagen
        mappedGiftCards.push({
          ...card,
          coverImageOriginal: bestImage,
          randomDiscount: this.generatePersistentDiscount(card.name),
        });
      }

      if (page === 1) {
        this.giftCards = mappedGiftCards;
      } else {
        this.giftCards = [...this.giftCards, ...mappedGiftCards];
      }

      // Actualizar el estado de carga
      this.isLoading = false;
      this.isLoadingMore = false;
      this.errorMessage = '';

      // Determinar si hay más gift cards para cargar
      const totalLoaded = this.giftCards.length;
      this.hasMore = totalLoaded < this.totalLimit && giftCards.length === this.pageSize;

    } catch (error) {
      console.error('Error al obtener las gift cards por categoría:', error);
      if (page === 1) {
        this.giftCards = [];
      }
      this.isLoading = false;
      this.isLoadingMore = false;
      this.hasMore = false;
      this.errorMessage = 'Hubo un error al cargar las gift cards. Por favor, intenta nuevamente más tarde.';
    }
  }




  async getBestImageUrl(card: KinguinGiftCard): Promise<string> {
    // 1. Recolecta todas las URLs de posibles imágenes
    const imageUrls: string[] = [];

    // coverImageOriginal
    if (card.coverImageOriginal) {
      imageUrls.push(card.coverImageOriginal);
    }

    // thumbnail
    if (card.images.cover?.thumbnail) {
      imageUrls.push(card.images.cover.thumbnail);
    }


    // coverImage
    if (card.coverImage) {
      imageUrls.push(card.coverImage);
    }

    // screenshots
    if (card.screenshots && card.screenshots.length > 0) {
      imageUrls.push(...card.screenshots.map(screenshot => screenshot.url));
    }

    //images screenshots
    // if (card.images.screenshots && card.images.screenshots.length > 0){
    //   imageUrls.push(...card.images.screenshots.map(screenshot => screenshot.url))
    // }


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


  loadMore(): void {
    if (this.hasMore && !this.isLoadingMore) {
      this.currentPage++;
      this.loadGiftCardsByCategory(this.selectedCategory!, this.currentPage);
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
