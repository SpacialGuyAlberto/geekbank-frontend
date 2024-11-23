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
      debounceTime(1000), // Espera 1000ms después del último evento
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
      console.log('Resultados de búsqueda:', data);

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
    const query = this.searchQuery.trim();
    if (query === '') {
      // Emitir resultados vacíos si la consulta está vacía
      this.searchResults.emit([]);
      this.uiStateService.setShowHighlights(false);
      this.cd.detectChanges();
      return;
    }

    // Cancelar cualquier búsqueda pendiente
    this.searchSubject.complete();
    this.searchSubscription.unsubscribe();

    // Realizar la búsqueda inmediatamente
    this.kinguinService.searchGiftCards(query).pipe(
      catchError(err => {
        console.error('Error en la búsqueda de tarjetas:', err);
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

      // Reiniciar el Subject y la suscripción para futuras búsquedas
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
        console.log('Resultados de búsqueda:', res);

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
