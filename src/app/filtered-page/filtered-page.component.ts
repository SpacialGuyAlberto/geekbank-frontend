// src/app/components/filtered-page/filtered-page.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KinguinGiftCard } from "../models/KinguinGiftCard";
import { KinguinService } from "../kinguin.service";
import { CurrencyPipe, CommonModule, NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryItemsComponent } from "../components/category-items/category-items.component";
import {Router} from "@angular/router";


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

  loadGiftCardsByCategory(category: string, page: number): void {
    let filters = {
      hideOutOfStock: false,
      genre: category,
      page: page,
      limit: this.pageSize,
      // Otros filtros que puedas tener
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

    this.kinguinService.getFilteredGiftCards(filters).subscribe(
      (giftCards) => {
        if (giftCards.length === 0 && page === 1) {
          console.warn(`No se encontraron productos para la categoría: ${category}`);
        }

        const mappedGiftCards = giftCards.map(card => ({
          ...card,
          coverImageOriginal: card.images.cover?.thumbnail || '',
          coverImage: card.images.cover?.thumbnail || ''
        }));

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
      },
      (error) => {
        console.error('Error al obtener las gift cards por categoría:', error);
        if (page === 1) {
          this.giftCards = [];
        }
        this.isLoading = false;
        this.isLoadingMore = false;
        this.hasMore = false;
        this.errorMessage = 'Hubo un error al cargar las gift cards. Por favor, intenta nuevamente más tarde.';
      }
    );
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
}
