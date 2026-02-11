import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ChangeDetectorRef, NgZone } from '@angular/core';
import { KinguinGiftCard } from "../kinguin-gift-cards/KinguinGiftCard";
import { RecommendationsService } from "../services/recommendations.service";
import {Observable, of, Subscription} from 'rxjs';
import {tap, catchError, map} from 'rxjs/operators';
import {AsyncPipe, CurrencyPipe, DecimalPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {Router} from '@angular/router';


@Component({
    selector: 'app-suggestions',
    templateUrl: './suggestions.component.html',
    imports: [
        NgClass,
        AsyncPipe,
        CurrencyPipe,
        NgForOf,
        NgIf,
        DecimalPipe
    ],
    styleUrls: ['./suggestions.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuggestionsComponent implements OnInit {
  @Input() kinguinId: number = 0;
  giftCards: KinguinGiftCard[] = [];
  isLoading: boolean = true; // Indicador de carga
  loadTime: number = 0;
  private subscription: Subscription = new Subscription();
  private readonly limit: number = 10; //
  private startTime: number = 0;
  private endTime: number = 0;
  constructor(
    private recommendationsService: RecommendationsService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadRecommendations();
    this.giftCards.map(card => console.log(card))
  }

  loadRecommendations() {
    this.isLoading = true;
    this.startTime = performance.now();
    this.ngZone.runOutsideAngular(() => { // Ejecutar fuera de Angular para evitar ciclos de detección
      const sub = this.recommendationsService.getContentBasedRecommendations(this.kinguinId, this.limit).pipe(
        tap((giftCards) => {
          this.ngZone.run(() => { // Volver a la zona de Angular para actualizar el estado
            this.giftCards = giftCards.map(card => ({
              ...card,
              coverImageOriginal:
                card.coverImageOriginal ||
                card.images.cover?.thumbnail ||
                card.coverImage,
              coverImage:
                card.images.cover?.thumbnail || '',
              randomDiscount: this.generatePersistentDiscount(card.name)
            }));
            this.isLoading = false;

            this.endTime = performance.now(); // Detener el cronómetro
            this.loadTime = this.endTime - this.startTime;
            console.log(`Tiempo de carga de recomendaciones: ${this.loadTime.toFixed(2)} ms`);

            this.cdr.detectChanges(); // Actualizar la vista una vez
            this.cdr.detach(); // Desactivar la detección de cambios
          });
        }),
        catchError((error) => {
          this.ngZone.run(() => {
            console.error('Error fetching recommendations', error);
            this.isLoading = false;
          });
          return of([]);
        })
      ).subscribe();

      this.subscription.add(sub);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  trackById(index: number, card: KinguinGiftCard): number {
    return card.kinguinId; // Asegúrate de que `id` es único para cada tarjeta
  }
  viewDetails(card: KinguinGiftCard): void {
    console.log('CARD ID: ' + card.kinguinId);
    this.router.navigate(['/gift-card-details', card.kinguinId]).then(success => {
      if (success) {
        console.log('Navigation successful');
      } else {
        console.log('Navigation failed');
      }
    });
    window.location.href = `/gift-card-details/${card.kinguinId}`;
  }


  generatePersistentDiscount(cardName: string): number {
    let hash = 0;
    for (let i = 0; i < cardName.length; i++) {
      hash = (hash << 5) - hash + cardName.charCodeAt(i);
      hash = hash & hash; // Convertir a 32 bits
    }
    return Math.abs(hash % 26) + 15; // Generar un valor entre 15 y 40
  }


}
