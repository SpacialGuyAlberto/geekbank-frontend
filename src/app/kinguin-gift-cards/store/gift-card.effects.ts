// src/app/features/gift-card/store/gift-card.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as GiftCardActions from './gift-card.actions';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import {KinguinService} from "../kinguin.service";

@Injectable()
export class GiftCardEffects {
  constructor(
    private actions$: Actions,
    private kinguinService: KinguinService
  ) {}

  loadGiftCards$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GiftCardActions.loadGiftCards),
      mergeMap(() =>
        this.kinguinService.getKinguinGiftCards(1).pipe( // Puedes adaptar para manejar paginación
          map(giftCards => GiftCardActions.loadGiftCardsSuccess({ giftCards })),
          catchError(error => of(GiftCardActions.loadGiftCardsFailure({ error })))
        )
      )
    )
  );

  loadGiftCardDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GiftCardActions.loadGiftCardDetails),
      mergeMap(action =>
        this.kinguinService.getGiftCardDetails(action.id).pipe(
          map(giftCard => GiftCardActions.loadGiftCardDetailsSuccess({ giftCard })),
          catchError(error => of(GiftCardActions.loadGiftCardDetailsFailure({ error })))
        )
      )
    )
  );

  loadGiftCardsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GiftCardActions.loadGiftCardsPage),
      mergeMap(action =>
        this.kinguinService.getKinguinGiftCards(action.page).pipe(
          map(giftCards => GiftCardActions.loadGiftCardsPageSuccess({ giftCards })),
          catchError(error => of(GiftCardActions.loadGiftCardsPageFailure({ error })))
        )
      )
    )
  );
}
