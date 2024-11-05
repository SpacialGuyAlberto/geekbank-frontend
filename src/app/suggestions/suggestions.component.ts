import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { KinguinGiftCard } from "../models/KinguinGiftCard";
import { RecommendationsService } from "../services/recommendations.service";
import { Observable, of } from 'rxjs';
import {tap, catchError, map} from 'rxjs/operators';
import {AsyncPipe, CurrencyPipe, NgClass, NgForOf} from "@angular/common";

@Component({
  selector: 'app-suggestions',
  templateUrl: './suggestions.component.html',
  standalone: true,
  imports: [
    NgClass,
    AsyncPipe,
    CurrencyPipe,
    NgForOf
  ],
  styleUrls: ['./suggestions.component.css']
})
export class SuggestionsComponent implements OnInit, OnChanges {
  @Input() kinguinId: number = 0;
  giftCards$: Observable<KinguinGiftCard[]> = of([]); // Observable para las gift cards
  isLoading: boolean = true; // Indicador de carga

  constructor(private recommendationsService: RecommendationsService) {}

  ngOnInit(): void {
    this.loadRecommendations();
    this.giftCards$.subscribe(card => console.log(card))
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['kinguinId'] && this.kinguinId) {
      this.loadRecommendations();
    }
  }

  loadRecommendations() {
    this.isLoading = true;
    this.giftCards$ = this.recommendationsService.getContentBasedRecommendations(this.kinguinId).pipe(
      tap(() => this.isLoading = false),
      map(giftCards => giftCards.map(card => {
        card.coverImageOriginal = card.images.cover?.thumbnail || '';
        card.coverImage = card.images.cover?.thumbnail || '';
        return card;
      })),
      catchError((error) => {
        console.error('Error fetching recommendations', error);
        this.isLoading = false;
        return of([]); // Devuelve un array vacío en caso de error
      })
    );
  }

}
