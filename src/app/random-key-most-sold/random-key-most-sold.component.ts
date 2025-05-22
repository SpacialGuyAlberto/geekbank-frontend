import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { KinguinService } from "../kinguin-gift-cards/kinguin.service";
import { KinguinGiftCard } from "../kinguin-gift-cards/KinguinGiftCard";
import { forkJoin, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { GiftCardDetailsComponent } from '../gift-card-details/gift-card-details.component';
import { CurrencyPipe, JsonPipe, NgClass, NgForOf, NgIf, NgStyle } from "@angular/common";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import Vibrant from 'node-vibrant';

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
    NgStyle,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class RandomKeyMostSoldComponent implements OnInit, AfterViewInit {


  keyIds: string[] = ['238730', '270922', '131347', '98412', '270922',
    '131346', '274530', '238730', '270922', '131347', '98412', '270922', '131346', '274530', '238730', '270922', '131347', '98412', '270922',
    '131346', '274530', '238730', '270922', '131347', '98412', '270922', '131346', '274530',
    '238730', '270922', '131347', '98412', '270922',
    '131346', '274530', '238730', '270922', '131347', '98412', '270922', '131346', '274530', '238730', '270922', '131347', '98412', '270922',
    '131346', '274530', '238730', '270922', '131347', '98412', '270922', '131346', '274530', '238730', '270922', '131347', '98412', '270922',
    '131346', '274530', '238730', '270922', '131347', '98412', '270922', '131346', '274530',
    '238730', '270922', '131347', '98412', '270922',
    '131346', '274530', '238730', '270922', '131347', '98412', '270922', '131346', '274530'];
  keys: KinguinGiftCard[] = [];
  displayedKeys: KinguinGiftCard[] = [];
  initialDisplayLimit: number = 7;
  displayLimit: number = this.initialDisplayLimit;
  displayIncrement: number = 7;
  hasMoreItems = false;
  isLoadingLarge: boolean = true;
  errorLarge: string = '';
  bannerDominantColor: string = '#ffffff'; // Color de fondo por defecto

  isExpanded: boolean = false; // Estado de expansión

  constructor(private kinguinService: KinguinService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.fetchKeys();
  }

  ngAfterViewInit() {
    const img = new Image();
    img.src = 'src/assets/fracture-fortnite.jpg';
    img.crossOrigin = 'Anonymous'; // Añade esto si tienes problemas de CORS
    img.onload = () => this.extractColor(img);
  }

  extractColor(img: HTMLImageElement) {
    Vibrant.from(img).getPalette()
      .then((palette) => {
        if (palette.Vibrant) {
          const rgb = palette.Vibrant.rgb;
          this.bannerDominantColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
        } else {
          this.bannerDominantColor = '#2c5364';
        }
      })
      .catch((error) => {
        console.error('Error al extraer el color dominante:', error);
        this.bannerDominantColor = '#2c5364';
      });
  }

  isMiddleCard(index: number): boolean {
    const totalCards = this.keys.length;
    const middleIndex = Math.floor(totalCards / 2);
    return index === middleIndex;
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

        this.isLoadingLarge = false;
        this.updateDisplayedKeys();
      },
      error: (err) => {
        console.error('Error al obtener las claves grandes:', err);
        this.errorLarge = 'No se pudieron cargar las claves grandes.';
        this.isLoadingLarge = false;
      }
    });
  }

  updateDisplayedKeys() {
    if (this.isExpanded) {
      this.displayedKeys = this.keys;
    } else {
      this.displayedKeys = this.keys.slice(0, this.displayLimit);
    }
    this.hasMoreItems = this.keys.length > this.displayedKeys.length;
  }

  showMoreItems() {
    if (this.displayLimit < this.keys.length) {
      // Incrementa el límite para mostrar más elementos
      this.displayLimit = Math.min(this.displayLimit + this.displayIncrement, this.keys.length);
      this.updateDisplayedKeys();
      if (this.displayLimit === this.keys.length) {
        this.isExpanded = true;

      }
    } else {
      // Reinicia el límite a la visualización inicial
      this.displayLimit = this.initialDisplayLimit;
      this.isExpanded = false;
      this.updateDisplayedKeys();

    }
    this.updateBannerColor();
  }



  updateBannerColor() {
    // Extrae el color dominante de la última tarjeta visible
    const lastVisibleKey = this.displayedKeys[this.displayedKeys.length - 1];
    if (lastVisibleKey && lastVisibleKey.coverImageOriginal) {
      const img = new Image();
      img.src = lastVisibleKey.coverImageOriginal;
      img.crossOrigin = 'Anonymous';
      img.onload = () => this.extractColor(img);
    }
  }

  viewDetails(key: KinguinGiftCard): void {
    this.dialog.open(GiftCardDetailsComponent, {
      data: key
    });
  }
}
