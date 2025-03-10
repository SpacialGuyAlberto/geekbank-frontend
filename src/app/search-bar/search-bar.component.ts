// src/app/components/search-bar/search-bar.component.ts
import { Component, Output, EventEmitter, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { KinguinService } from '../kinguin-gift-cards/kinguin.service';
import { KinguinGiftCard } from '../kinguin-gift-cards/KinguinGiftCard';
import { FormsModule } from "@angular/forms";
import { UIStateServiceService } from "../services/uistate-service.service";
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
      debounceTime(5000),
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

    if (card.images.screenshots && card.images.screenshots.length > 0){
      imageUrls.push(...card.images.screenshots.map(screenshot => screenshot.url))
    }

    if (card.screenshots && card.screenshots.length > 0) {
      imageUrls.push(...card.screenshots.map(screenshot => screenshot.url));
    }

    const uniqueImageUrls = Array.from(new Set(imageUrls));

    const promises = uniqueImageUrls.map(url =>
      this.getImageResolution(url)
        .then(res => ({
          url,
          resolution: res.width * res.height,
        }))
        .catch(err => {
          console.error(`Error al cargar la imagen ${url}:`, err);
          return { url, resolution: 0 }; // Considera 0 si falla
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
  onSearchEnter(): void {
    const query = this.searchQuery.trim().toLowerCase();
    const isFreeFire = query.includes('free fire') || query.includes('freefair') || query.includes('free fair');
    this.isFreeFireSearch.emit(isFreeFire);

    if (query === '') {
      this.searchResults.emit([]);
      this.uiStateService.setShowHighlights(false);
      this.cd.detectChanges();
      return;
    }

    this.searchSubject.complete();
    this.searchSubscription.unsubscribe();

    this.kinguinService.searchGiftCards(query).pipe(
      catchError(err => {
        console.error('Error en la búsqueda de tarjetas (Enter):', err);
        return of([] as KinguinGiftCard[]);
      })
    ).subscribe(async (data: KinguinGiftCard[]) => {
      console.log('Resultados de búsqueda (Enter):', data);

      const giftCardsPromises = data.map(async card => {
        card.coverImageOriginal =
          card.coverImageOriginal ||
          card.images.cover?.thumbnail ||
          card.coverImage ||
          await this.getBestImageUrl(card); // Llama a la función asíncrona si no hay imagen disponible
        card.coverImage = card.images.cover?.thumbnail || '';
        return card;
      });

      const giftCards = await Promise.all(giftCardsPromises);

      this.searchResults.emit(giftCards);
      this.uiStateService.setShowHighlights(false);
      this.cd.detectChanges();

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
      ).subscribe(async (res: KinguinGiftCard[]) => {
        console.log('Resultados de búsqueda (re-subscribed):', res);

        const gcPromises = res.map(async card => {
          card.coverImageOriginal =
            card.coverImageOriginal ||
            card.images.cover?.thumbnail ||
            card.coverImage ||
            await this.getBestImageUrl(card);
          card.coverImage = card.images.cover?.thumbnail || '';
          return card;
        });

        const gc = await Promise.all(gcPromises);

        this.searchResults.emit(gc);
        this.uiStateService.setShowHighlights(false);
        this.cd.detectChanges();
      });
    });
  }

}
