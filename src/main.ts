import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';  // Aquí añadimos provideHttpClient
import {routes} from "./app/app.routes";
import { importProvidersFrom } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {BrowserAnimationsModule, provideAnimations} from "@angular/platform-browser/animations";
import {StoreModule, StoreRootModule} from "@ngrx/store";
import {authReducer} from "./app/state/auth/auth.reducer";
import {giftCardReducer} from "./app/kinguin-gift-cards/store/gift-card.reducer";
import {StoreDevtoolsModule} from "@ngrx/store-devtools";
import {EffectsModule} from "@ngrx/effects";

//Effects
import {GiftCardEffects} from "./app/kinguin-gift-cards/store/gift-card.effects";
import {AuthEffects} from "./app/state/auth/auth.effects";

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot(),
      StoreModule.forRoot({
        giftCards: giftCardReducer,
        auth: authReducer

      }),
      StoreDevtoolsModule.instrument(),
      EffectsModule.forRoot([
        AuthEffects,
        GiftCardEffects
      ])
    )
  ]
}).catch(err => console.error(err));
