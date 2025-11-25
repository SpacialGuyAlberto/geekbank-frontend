import { Component } from '@angular/core';
import {SearchBarComponent} from "../search-bar/search-bar.component";

import {KinguinGiftCard} from "../kinguin-gift-cards/KinguinGiftCard";
import {CurrencyPipe, NgForOf, NgIf} from "@angular/common";
import {HighlightService} from "./highlights.service";
import {OnInit} from "@angular/core";
import {HighlightItem, HighlightItemWithGiftcard} from "./HighlightItem";
import {KinguinService} from "../kinguin-gift-cards/kinguin.service";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";

@Component({
  selector: 'app-highlights-config',
  standalone: true,
  imports: [
    SearchBarComponent,
    CurrencyPipe,
    NgForOf,
    MatSnackBarModule,
    NgIf
  ],
  templateUrl: './highlights-config.component.html',
  styleUrls: ['./highlights-config.component.css']
})

export class HighlightsConfigComponent implements OnInit {
  giftCards: KinguinGiftCard[] = [];
  currentHighlights: KinguinGiftCard[] = [];
  highlightList: HighlightItem[] = [];
  currentHighlightItem: HighlightItem | undefined = undefined;
  modalVisible: boolean = false;
  currentSelectedCard: KinguinGiftCard | undefined = undefined;
  currectSelectedCardImages: string[] = [];
  currentImage: string = "";
  protected currentImageIndex: number = 0;

  constructor(
    private highlightService: HighlightService,
    private kinguinService: KinguinService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.highlightService.getHighlights().subscribe((data) => {
      data.map((item) => this.highlightList.push(item));
    });

    this.kinguinService.getGiftCardsModel().subscribe((data: KinguinGiftCard[]) => {
      this.giftCards = data;
    });
  }

  handleSearchResults(results: KinguinGiftCard[]): void {
    this.giftCards = results;
  }

  addToHighlights(card: KinguinGiftCard): void {

    this.modalVisible = true;
    this.currentSelectedCard = card;

    if (card.imageUrl != undefined){
      this.currectSelectedCardImages.push(card.imageUrl);
    }

    if (card.coverImageOriginal != undefined){
      this.currectSelectedCardImages.push(card.coverImageOriginal);
    }

    if (card.images.cover.thumbnail != undefined){
      this.currectSelectedCardImages.push(card.images.cover.thumbnail)
    }

    this.currentSelectedCard.images.screenshots.map(value => {
      this.currectSelectedCardImages.push(value.url)
    });

    if (!this.currentHighlights.includes(card)) {
      this.currentHighlights.push(card);
      this.currentHighlightItem = this.createHighlightFromCard(card);
      this.highlightList.push(this.currentHighlightItem);
    }

    this.currentImage = card.images.screenshots[0].url;
  }

  createHighlightFromCard(card: KinguinGiftCard): HighlightItem {
    let highlightItem : HighlightItem | undefined;
    highlightItem = {
      productId: card.kinguinId,
      imageUrl : "",
      title: card.name,
      price: card.price
    };

    return highlightItem;
  }

  removeFromHighlights(cardToRemove: HighlightItem): void {
    this.highlightList = this.highlightList.filter((card) => card !== cardToRemove);
  }

  save(): void {
    const productIds = this.currentHighlights.map((card) => card.kinguinId);
    const currentHighlights = this.highlightList;

    this.highlightService.removeHighlights([]).subscribe(
      () => {

        this.showSnackBar("Changes saved successfully.")
        this.highlightService.addHighlights(currentHighlights).subscribe(
          () => {

            this.showSnackBar("Changes saved successfully.")
          },
          (error) => {
            console.error('Failed to save highlights', error);
            this.showSnackBar("Failed saving changes.")
          }
        );
      },
      (error) => {
        console.error('Failed to remove previous highlights', error);
        this.showSnackBar("Failed saving changes.")
      }
    );
  }

  showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }

  previousImage() {
    if (this.currectSelectedCardImages.length > 0){
      this.currentImageIndex = (this.currentImageIndex - 1 + this.currectSelectedCardImages.length) % this.currectSelectedCardImages.length;
      this.currentImage = this.currectSelectedCardImages[this.currentImageIndex];
    }
  }

  nextImage() {
    if (this.currectSelectedCardImages.length > 0){
      this.currentImageIndex = (this.currentImageIndex + 1) % this.currectSelectedCardImages.length;
      this.currentImage = this.currectSelectedCardImages[this.currentImageIndex];
    }
  }

  closeModal(){
    this.modalVisible = false;
    this.currentHighlightItem = undefined;
    this.currectSelectedCardImages = [];
  }

  selectImageAsHighlightImage(): void {
    if (this.currentHighlightItem){
      this.currentHighlightItem.imageUrl = this.currentImage;
    }
    this.showSnackBar(`Image ${this.currentImage} for product ${this.currentHighlightItem?.productId} successfully selected.`)
    this.currentHighlightItem = undefined;
    this.currectSelectedCardImages = [];
  }

}
