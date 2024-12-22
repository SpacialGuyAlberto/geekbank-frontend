// src/app/components/search-bar/search-bar.component.ts
import { Component, Output, EventEmitter, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { KinguinService } from '../kinguin.service';
import { KinguinGiftCard } from '../models/KinguinGiftCard';
import { FormsModule } from "@angular/forms";
import { UIStateServiceService } from "../uistate-service.service";
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  templateUrl: './search-bar.component.html',
  imports: [
    FormsModule
  ],
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Output() searchResults = new EventEmitter<KinguinGiftCard[]>();
  @Output() isFreeFireSearch = new EventEmitter<boolean>();

  searchQuery: string = '';

  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  constructor(
    private kinguinService: KinguinService,
    private uiStateService: UIStateServiceService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(5000), // Espera 5000ms después del último evento
      distinctUntilChanged(),
      switchMap(query => {
        if (query.trim() === '') {
          return of([] as KinguinGiftCard[]);
        }
        return this.kinguinService.searchGiftCards(query).pipe(
          catchError(err => {
            console.error('Error en la búsqueda de tarjetas:', err);
            return of([] as KinguinGiftCard[]);
          })
        );
      })
    ).subscribe((data: KinguinGiftCard[]) => {
      console.log('Resultados de búsqueda (debounced):', data);

      const giftCards = data.map(card => {
        card.coverImageOriginal = card.images.cover?.thumbnail || '';
        card.coverImage = card.images.cover?.thumbnail || '';
        return card;
      });

      this.searchResults.emit(giftCards);
      this.uiStateService.setShowHighlights(false);
      this.cd.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onSearchEnter(): void {
    const query = this.searchQuery.trim().toLowerCase();
    const isFreeFire = query.includes('free fire') || query.includes('freefair') || query.includes('free fair');
    this.isFreeFireSearch.emit(isFreeFire);

    if (query === '') {
      // Si la consulta está vacía, emitir resultados vacíos
      this.searchResults.emit([]);
      this.uiStateService.setShowHighlights(false);
      this.cd.detectChanges();
      return;
    }

    // Cancelar cualquier búsqueda pendiente y reiniciar la suscripción
    this.searchSubject.complete();
    this.searchSubscription.unsubscribe();

    // Realizar la búsqueda inmediata al presionar Enter
    this.kinguinService.searchGiftCards(query).pipe(
      catchError(err => {
        console.error('Error en la búsqueda de tarjetas (Enter):', err);
        return of([] as KinguinGiftCard[]);
      })
    ).subscribe((data: KinguinGiftCard[]) => {
      console.log('Resultados de búsqueda (Enter):', data);

      const giftCards = data.map(card => {
        card.coverImageOriginal = card.images.cover?.thumbnail || '';
        card.coverImage = card.images.cover?.thumbnail || '';
        return card;
      });

      this.searchResults.emit(giftCards);
      this.uiStateService.setShowHighlights(false);
      this.cd.detectChanges();

      // Reiniciar el Subject y la suscripción para futuras búsquedas "on the fly"
      this.searchSubject = new Subject<string>();
      this.searchSubscription = this.searchSubject.pipe(
        debounceTime(3000),
        distinctUntilChanged(),
        switchMap(q => {
          if (q.trim() === '') {
            return of([] as KinguinGiftCard[]);
          }
          return this.kinguinService.searchGiftCards(q).pipe(
            catchError(err => {
              console.error('Error en la búsqueda de tarjetas:', err);
              return of([] as KinguinGiftCard[]);
            })
          );
        })
      ).subscribe((res: KinguinGiftCard[]) => {
        console.log('Resultados de búsqueda (re-subscribed):', res);

        const gc = res.map(card => {
          card.coverImageOriginal = card.images.cover?.thumbnail || '';
          card.coverImage = card.images.cover?.thumbnail || '';
          return card;
        });

        this.searchResults.emit(gc);
        this.uiStateService.setShowHighlights(false);
        this.cd.detectChanges();
      });
    });
  }
}
