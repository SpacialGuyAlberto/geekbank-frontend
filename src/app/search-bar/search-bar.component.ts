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

  async getBestImageUrl(card: KinguinGiftCard): Promise<string> {
    // 1. Recolecta todas las URLs de posibles imágenes
    const imageUrls: string[] = [];

    // coverImageOriginal
    if (card.coverImageOriginal) {
      imageUrls.push(card.coverImageOriginal);
    }

    // thumbnail
    if (card.images.cover?.thumbnail) {
      imageUrls.push(card.images.cover.thumbnail);
    }

    // coverImage
    if (card.coverImage) {
      imageUrls.push(card.coverImage);
    }

    if (card.images.screenshots && card.images.screenshots.length > 0){
      imageUrls.push(...card.images.screenshots.map(screenshot => screenshot.url))
    }

    // screenshots
    if (card.screenshots && card.screenshots.length > 0) {
      imageUrls.push(...card.screenshots.map(screenshot => screenshot.url));
    }

    // 2. Eliminar duplicados
    const uniqueImageUrls = Array.from(new Set(imageUrls));

    // 3. Obtener resolución de cada URL
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

    // 4. Filtrar imágenes válidas y ordenar por resolución descendente
    const validImages = results
      .filter(img => img.resolution > 0)
      .sort((a, b) => b.resolution - a.resolution);

    // 5. Retornar la mejor imagen o vacío
    return validImages.length > 0 ? validImages[0].url : '';
  }

// Método para obtener dimensiones de una imagen (reutilizado de loadHighlights)
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
    ).subscribe(async (data: KinguinGiftCard[]) => {
      console.log('Resultados de búsqueda (Enter):', data);

      // Procesar las tarjetas de forma asíncrona
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
      ).subscribe(async (res: KinguinGiftCard[]) => {
        console.log('Resultados de búsqueda (re-subscribed):', res);

        const gcPromises = res.map(async card => {
          card.coverImageOriginal =
            card.coverImageOriginal ||
            card.images.cover?.thumbnail ||
            card.coverImage ||
            await this.getBestImageUrl(card); // Llama a la función asíncrona si no hay imagen disponible
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
