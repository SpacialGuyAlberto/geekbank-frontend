import {Component, OnInit} from '@angular/core';
import {KinguinGiftCard} from "../models/KinguinGiftCard";
import {KinguinService} from "../kinguin.service";
import {MatDialog} from "@angular/material/dialog";
import {forkJoin, Observable} from "rxjs";
import {GiftCardDetailsComponent} from "../gift-card-details/gift-card-details.component";
import {NgClass, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-random-keys-main',
  standalone: true,
  imports: [
    NgForOf,
    NgClass,
    NgIf
  ],
  templateUrl: './random-keys-main.component.html',
  styleUrl: './random-keys-main.component.css'
})
export class RandomKeysMainComponent implements OnInit{

  keyIds: string[] = ['219681', '98412', '270922'];
  keys: KinguinGiftCard[] = [];
  displayedKeys: KinguinGiftCard[] = [];
  displayLimit: number = 3;
  isLoadingLarge: boolean = true;
  errorLarge: string = '';
  hasMoreItems = false;
  middleCardContainer: string = '';

  constructor(private kinguinService: KinguinService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.fetchKeys();
  }

  isMiddleCard(index: number): boolean {
    const totalCards = this.keys.length; // O this.smallKeys.length si estás en el banner de pequeñas
    const middleIndex = Math.floor(totalCards / 2);
    return index === middleIndex;
  }

  updateContainerClass(middleCard: boolean){
    if (middleCard){
      this.middleCardContainer = 'offer-card-container-middle'
    } else {
      this.middleCardContainer = 'offer-card-container'
    }
  }

  fetchKeys(): void {
    const largeKeysObservables: Observable<KinguinGiftCard>[] = this.keyIds.map(id =>
      this.kinguinService.getGiftCardDetails(id)
    );

    forkJoin(largeKeysObservables).subscribe({
      next: (keys: KinguinGiftCard[]) => {
        this.keys = keys.map(key => {
          key.coverImageOriginal = key.images.cover?.thumbnail || '';
          key.coverImage = key.images.cover?.thumbnail || '';
          return key;
        });
        console.log('Large Keys:', this.keys); // Para depuración
        this.isLoadingLarge = false;
      },
      error: (err) => {
        console.error('Error al obtener las claves grandes:', err);
        this.errorLarge = 'No se pudieron cargar las claves grandes.';
        this.isLoadingLarge = false;
      }
    });
    this.updateDisplayedKeys()
  }




  updateDisplayedKeys() {
    this.displayedKeys = this.keys.slice(0, this.displayLimit);
    this.hasMoreItems = this.keys.length > this.displayLimit;
  }

  showMoreItems() {
    this.displayLimit += 8; // Increase limit to show more items
    this.updateDisplayedKeys();
  }

  viewDetails(key: KinguinGiftCard): void {
    // Abrir un modal con los detalles de la clave
    this.dialog.open(GiftCardDetailsComponent, {
      data: key
    });
  }


}
