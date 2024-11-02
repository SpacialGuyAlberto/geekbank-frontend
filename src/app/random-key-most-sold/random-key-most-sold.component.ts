import { Component, OnInit } from '@angular/core';
import { KinguinService } from "../kinguin.service";
import { KinguinGiftCard } from "../models/KinguinGiftCard";
import { forkJoin, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { GiftCardDetailsComponent } from '../gift-card-details/gift-card-details.component';
import {CurrencyPipe, JsonPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-random-key-most-sold',
  templateUrl: './random-key-most-sold.component.html',
  styleUrls: ['./random-key-most-sold.component.css'],
  standalone: true,
  imports: [
    CurrencyPipe,
    NgForOf,
    NgClass,
    MatProgressSpinner,
    NgIf,
    JsonPipe,
  ]
})
export class RandomKeyMostSoldComponent implements OnInit {

  keyIds: string[] = ['238730', '270922', '131347', '98412', '270922', '131346', '274530'];

  keys: KinguinGiftCard[] = [];

  isLoadingLarge: boolean = true;
  errorLarge: string = '';

  constructor(private kinguinService: KinguinService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.fetchKeys();
  }

  isMiddleCard(index: number): boolean {
    const totalCards = this.keys.length; // O this.smallKeys.length si estás en el banner de pequeñas
    const middleIndex = Math.floor(totalCards / 2);
    return index === middleIndex;
  }

  /**
   * Método para obtener las claves grandes usando forkJoin
   */
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
  }


  viewDetails(key: KinguinGiftCard): void {
    this.dialog.open(GiftCardDetailsComponent, {
      data: key
    });
  }

}
