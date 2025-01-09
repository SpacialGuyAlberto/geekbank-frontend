import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {KinguinGiftCard} from "../models/KinguinGiftCard";
import {KinguinService} from "../kinguin.service";
import { CurrencyPipe, CommonModule, NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import {CategoryItemsComponent} from "../components/category-items/category-items.component";
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

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
  pageSize: number = 10;
  totalLimit: number = 1000;
  hasMore: boolean = true;
  errorMessage: string = '';

  // Banner dinámico
  bannerImage: string = '';

  // Array de géneros
  genres: { key: string; label: string; icon?: string }[] = [
    { key: 'Action', label: 'Action', icon: 'fa-solid fa-plane' },
    { key: 'Adventure', label: 'Adventure', icon: 'fa-brands fa-space-awesome' },
    { key: 'Anime', label: 'Anime' },
    { key: 'Casual', label: 'Casual' },
    { key: 'Co-op', label: 'Co op' },
    { key: 'Dating Simulator', label: 'Dating Simulator' },
    { key: 'Fighting', label: 'Fighting' },
    { key: 'Fps', label: 'FPS' },
    { key: 'Hack and Slash', label: 'Hack and Slash' },
    { key: 'Hidden Object', label: 'Hidden Object' },
    { key: 'Horror', label: 'Horror' },
    { key: 'Indie', label: 'Indie' },
    { key: 'Life simulation', label: 'Life simulation' },
    { key: 'Mmo', label: 'MMO' },
    { key: 'Music soundtrack', label: 'Music / Soundtrack' },
    { key: 'Online courses', label: 'Online Courses' },
    { key: 'Open World', label: 'Open World' },
    { key: 'Platformer', label: 'Platformer' },
    { key: 'Point and click', label: 'Point & click' },
    { key: 'PSN Card', label: 'PSN Card' },
    { key: 'Puzzle', label: 'Puzzle' },
    { key: 'Racing', label: 'Racing' },
    { key: 'Rpg', label: 'RPG' },
    { key: 'Simulation', label: 'Simulation' },
    { key: 'Software', label: 'Software' },
    { key: 'Sport', label: 'Sport' },
    { key: 'Story rich', label: 'Story rich' },
    { key: 'Strategy', label: 'Strategy' },
    { key: 'Subscription', label: 'Subscription' },
    { key: 'Survival', label: 'Survival' },
    { key: 'Third-Person Shooter', label: 'Third-Person Shooter' },
    { key: 'Visual novel', label: 'Visual Novel' },
    { key: 'VR Games', label: 'VR Games' },
    { key: 'XBOX LIVE Gold Card', label: 'XBOX LIVE Gold Card' },
    { key: 'XBOX LIVE Points', label: 'XBOX LIVE Points' },
  ];

  constructor(
    private route: ActivatedRoute,
    private kinguinService: KinguinService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.selectedCategory = params.get('category');

      if (this.selectedCategory) {
        // Switch/case para asignar el banner según el género
        switch (this.selectedCategory) {
          case 'Action':
            this.bannerImage = 'assets/action-banner.webp';
            break;
          case 'Adventure':
            this.bannerImage = 'assets/adventure2.webp';
            break;
          case 'Anime':
            this.bannerImage = 'assets/anime.webp';
            break;
          case 'Co-op':
            this.bannerImage = 'assets/co-op.webp';
            break;
          case 'Casual':
            this.bannerImage = 'assets/casual.webp';
            break;
          case 'Dating Simulator':
            this.bannerImage = 'assets/dating.webp';
            break;
          case 'Open World':
            this.bannerImage = 'assets/Open-World.webp';
            break;
          case 'Hack and Slash':
            this.bannerImage = 'assets/hack-slash.webp';
            break;
          case 'Fps':
            this.bannerImage = 'assets/fps.webp';
            break;
          case 'Platformer':
            this.bannerImage = 'assets/platform.webp';
            break;
          case 'Racing':
            this.bannerImage = 'assets/racing.webp';
            break;
          case 'Rpg':
            this.bannerImage = 'assets/rpg.webp';
            break;
          case 'Software':
            this.bannerImage = 'assets/software.webp';
            break;

          // ... añade más cases si quieres control total

          default:
            // Reemplaza espacios por '-' y asigna el .webp

            const sanitized = this.selectedCategory.replace(/\s+/g, '-');
            this.bannerImage = 'assets/action-banner.webp';
            break;
        }

        // Carga las gift cards de la categoría
        this.loadGiftCardsByCategory(this.selectedCategory, this.currentPage);
      } else {
        this.isLoading = false;
      }
    });
  }

  private cleanFilters(filters: any): any {
    return Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) => value !== '' && value !== undefined && value !== null
      )
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
      priceRange: undefined
    };

    filters = this.cleanFilters(filters);

    // Actualiza estados de carga
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
        console.warn(`No se encontraron productos para la categoría: ${category}`);
      }

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
        this.giftCards = mappedGiftCards;
      } else {
        this.giftCards = [...this.giftCards, ...mappedGiftCards];
      }

      // Actualiza el estado de carga
      this.isLoading = false;
      this.isLoadingMore = false;
      this.errorMessage = '';

      // Determina si hay más gift cards
      const totalLoaded = this.giftCards.length;
      this.hasMore =
        totalLoaded < this.totalLimit && giftCards.length === this.pageSize;
    } catch (error) {
      console.error('Error al obtener las gift cards por categoría:', error);
      if (page === 1) {
        this.giftCards = [];
      }
      this.isLoading = false;
      this.isLoadingMore = false;
      this.hasMore = false;
      this.errorMessage =
        'Hubo un error al cargar las gift cards. Por favor, intenta nuevamente más tarde.';
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
    if (card.screenshots && card.screenshots.length > 0) {
      imageUrls.push(...card.screenshots.map(s => s.url));
    }

    const uniqueImageUrls = Array.from(new Set(imageUrls));
    const promises = uniqueImageUrls.map(url =>
      this.getImageResolution(url)
        .then(res => ({
          url,
          resolution: res.width * res.height
        }))
        .catch(err => {
          console.error(`Error al cargar la imagen ${url}:`, err);
          return { url, resolution: 0 };
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
      if (this.selectedCategory) {
        this.loadGiftCardsByCategory(this.selectedCategory, this.currentPage);
      }
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
    let hash = 0;
    for (let i = 0; i < cardName.length; i++) {
      hash = (hash << 5) - hash + cardName.charCodeAt(i);
      hash = hash & hash;
    }
    // Genera número entre 15 y 40 basado en el hash
    const random = Math.abs(hash % 26) + 15;
    return random;
  }
}
