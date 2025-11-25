import {Component, OnInit} from '@angular/core';
import {MainScreenGiftCardService} from "./main-screen-gift-card-service.service";
import {KinguinService} from "../kinguin-gift-cards/kinguin.service";
import {MatSnackBar} from '@angular/material/snack-bar';
import {MainScreenGiftCardItem, MainScreenGiftCardItemDTO} from "./MainScreenGiftCardItem";
import {KinguinGiftCard} from "../kinguin-gift-cards/KinguinGiftCard";
import {SearchBarComponent} from "../search-bar/search-bar.component";
import {CurrencyPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {GiftcardClassification} from "./giftcard-classification.enum";

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
  mainScreenGiftCardItems: MainScreenGiftCardItemDTO[] = []
  currentGiftCards: KinguinGiftCard[] = [];
  currentPage: number = 0;
  pageSize: number = 14;
  totalPages: number = 0;
  isListView: boolean = false;
  showClassificationModal = false;
  selectedCardToClassify: KinguinGiftCard | null = null;
  selectedClassification: GiftcardClassification | undefined  = undefined;
  selectedFilter: GiftcardClassification | 'ALL' = 'ALL';

  constructor(
    private mainScreenGiftCardService: MainScreenGiftCardService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadGiftCards(this.currentPage, this.pageSize);
  }

  handleSearchResults(results: KinguinGiftCard[]): void {
    this.giftCards = results;
  }

  toggleViewMode(): void {
    this.isListView = !this.isListView;
  }

  addToGiftCards(card: KinguinGiftCard): void {
    if (!this.currentGiftCards.includes(card)) {
      this.currentGiftCards.push(card);
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
      this.mainScreenGiftCardService.addtoMainScreenGiftCards(dto).subscribe( card => {
        this.showSnackBar(`Card ${card.productId} added successfully.`);
      })

      if (!alreadyAdded) {
        this.currentGiftCards.push(this.selectedCardToClassify);
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

    this.mainScreenGiftCardService.removeGiftCardItem(cardToRemove).subscribe({
      next: () => {
        this.showSnackBar("Eliminado correctamente.")
      },
      error: (err) => {
        this.showSnackBar("Error al eliminar card.")
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
        },
        error: (err) => {
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
}
