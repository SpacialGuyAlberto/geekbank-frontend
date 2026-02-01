import { Component, OnInit } from '@angular/core';
import { MainScreenGiftCardService } from "./main-screen-gift-card-service.service";
import { KinguinService } from "../kinguin-gift-cards/kinguin.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import { MainScreenGiftCardItem, MainScreenGiftCardItemDTO } from "./MainScreenGiftCardItem";
import { KinguinGiftCard } from "../kinguin-gift-cards/KinguinGiftCard";
import { SearchBarComponent } from "../search-bar/search-bar.component";
import { CurrencyPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { GiftcardClassification } from "./giftcard-classification.enum";

@Component({
  selector: 'app-main-screen-gift-card-config',
  standalone: true,
  imports: [
    SearchBarComponent,
    CurrencyPipe,
    NgForOf,
    FormsModule,
    MatButtonModule,
    NgIf,
    NgClass,
  ],
  templateUrl: './main-screen-gift-card-config.component.html',
  styleUrls: ['./main-screen-gift-card-config.component.css']
})
export class MainScreenGiftCardConfigComponent implements OnInit {

  giftCards: KinguinGiftCard[] = [];
  classificationKeys = Object.values(GiftcardClassification);
  mainScreenGiftCardItems: MainScreenGiftCardItemDTO[] = [];
  currentGiftCards: KinguinGiftCard[] = [];

  currentPage: number = 0;
  pageSize: number = 14;
  totalPages: number = 0;
  isListView: boolean = false;

  showClassificationModal = false;
  selectedCardToClassify: KinguinGiftCard | null = null;
  selectedClassification: GiftcardClassification | undefined = undefined;

  selectedFilter: GiftcardClassification | 'ALL' = 'ALL';

  // ⬇️ mapa para cachear la mejor imagen por productId (kinguinId)
  bestImageUrls: { [productId: number]: string } = {};

  constructor(
    private mainScreenGiftCardService: MainScreenGiftCardService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadGiftCards(this.currentPage, this.pageSize);
  }

  handleSearchResults(results: KinguinGiftCard[]): void {
    this.giftCards = results;
    this.computeBestImages(results);
  }

  toggleViewMode(): void {
    this.isListView = !this.isListView;
  }

  addToGiftCards(card: KinguinGiftCard): void {
    if (!this.currentGiftCards.includes(card)) {
      this.currentGiftCards.push(card);
      this.computeBestImages([card]);
    }
    this.selectedCardToClassify = card;
    this.showClassificationModal = true;
  }

  essambleMainCardDTO(card: KinguinGiftCard, classification: GiftcardClassification): MainScreenGiftCardItemDTO {
    const item: MainScreenGiftCardItem = {
      id: 23456,
      productId: card.kinguinId,
      createdAt: new Date(),
      classification: classification
    };
    const dto: MainScreenGiftCardItemDTO = {
      mainScreenGiftCardItem: item,
      giftcard: card,
    };
    return dto;
  }

  get filteredMainScreenGiftCardItems(): MainScreenGiftCardItemDTO[] {
    if (this.selectedFilter === 'ALL') {
      return this.mainScreenGiftCardItems;
    }
    return this.mainScreenGiftCardItems.filter(
      dto => dto.mainScreenGiftCardItem.classification === this.selectedFilter
    );
  }

  confirmClassification(): void {
    if (this.selectedCardToClassify && this.selectedClassification) {

      const alreadyAdded = this.currentGiftCards.some(
        card => card.kinguinId === this.selectedCardToClassify!.kinguinId
      );

      const dto = this.essambleMainCardDTO(this.selectedCardToClassify, this.selectedClassification);
      this.mainScreenGiftCardService.addtoMainScreenGiftCards(dto).subscribe(card => {
        this.showSnackBar(`Card ${card.productId} added successfully.`);
      });

      if (!alreadyAdded) {
        this.currentGiftCards.push(this.selectedCardToClassify);
        this.computeBestImages([this.selectedCardToClassify]);
      }
    }

    this.resetModal();
  }

  cancelClassification(): void {
    this.resetModal();
  }

  private resetModal(): void {
    this.showClassificationModal = false;
    this.selectedCardToClassify = null;
    this.selectedClassification = undefined;
  }

  removeFromGiftCards(cardToRemove: KinguinGiftCard): void {

    if (this.currentGiftCards.includes(cardToRemove)) {
      this.currentGiftCards.splice(this.currentGiftCards.indexOf(cardToRemove), 1);
    }

    // También lo quitamos de la lista de DTO para que desaparezca del panel derecho
    this.mainScreenGiftCardItems = this.mainScreenGiftCardItems
      .filter(dto => dto.giftcard.kinguinId !== cardToRemove.kinguinId);

    this.mainScreenGiftCardService.removeGiftCardItem(cardToRemove).subscribe({
      next: () => {
        this.showSnackBar("Eliminado correctamente.");
      },
      error: () => {
        this.showSnackBar("Error al eliminar card.");
      }
    });
  }

  loadGiftCards(page: number, size: number): void {
    this.mainScreenGiftCardService.getMainScreenGiftCardItems(page, size)
      .subscribe({
        next: (res: any) => {

          let items: MainScreenGiftCardItemDTO[] = [];

          if (Array.isArray(res)) {
            items = res;
            this.currentPage = 0;
            this.totalPages = 1;

          } else if (res && Array.isArray(res.content)) {
            items = res.content;
            this.currentPage = res.number;
            this.totalPages = res.totalPages;

          } else {
            return;
          }

          this.mainScreenGiftCardItems = items;
          this.currentGiftCards = items.map(dto => dto.giftcard);

          // calcular mejores imágenes para las cards que vienen de BD
          this.computeBestImages(this.currentGiftCards);
        },
        error: () => {
          this.showSnackBar("Failed loading gift cards.");
        }
      });
  }

  onNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadGiftCards(this.currentPage, this.pageSize);
    }
  }

  onPrevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadGiftCards(this.currentPage, this.pageSize);
    }
  }

  showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }

  // ================== IMÁGENES: LÓGICA PARA ELEGIR LA MEJOR ==================

  private computeBestImages(cards: KinguinGiftCard[]): void {
    cards.forEach(card => {
      const id = card.kinguinId;

      // Evitamos recalcular si ya existe
      if (this.bestImageUrls[id]) {
        return;
      }

      this.getBestImageUrl(card)
        .then(url => {
          this.bestImageUrls[id] =
            url ||
            card.coverImage ||
            (card as any).coverImageOriginal ||
            'assets/images/default-giftcard.png'; // ajusta a tu ruta real
        })
        .catch(() => {
          this.bestImageUrls[id] =
            card.coverImage ||
            (card as any).coverImageOriginal ||
            'assets/images/default-giftcard.png';
        });
    });
  }

  async getBestImageUrl(card: KinguinGiftCard): Promise<string> {
    const imageSources: Array<{ key: string, value: any }> = [
      { key: 'coverImageOriginal', value: (card as any).coverImageOriginal },
      { key: 'images.cover.thumbnail', value: (card as any).images?.cover?.thumbnail },
      { key: 'coverImage', value: card.coverImage },
      { key: 'images.screenshots', value: (card as any).images?.screenshots },
      { key: 'screenshots', value: (card as any).screenshots }
    ];

    const imageUrls: string[] = [];

    for (const source of imageSources) {
      switch (source.key) {
        case 'coverImageOriginal':
        case 'images.cover.thumbnail':
        case 'coverImage':
          if (source.value) {
            imageUrls.push(source.value);
          }
          break;

        case 'images.screenshots':
        case 'screenshots':
          if (Array.isArray(source.value) && source.value.length > 0) {
            imageUrls.push(...source.value.map((s: any) => s.url));
          }
          break;
      }
    }

    const uniqueImageUrls = Array.from(new Set(imageUrls));

    if (uniqueImageUrls.length === 0) {
      return '';
    }

    const promises = uniqueImageUrls.map(url =>
      this.getImageResolution(url)
        .then(res => ({
          url,
          resolution: res.width * res.height,
        }))
        .catch(() => ({ url, resolution: 0 }))
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
}
