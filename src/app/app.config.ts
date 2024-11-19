import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection, isDevMode } from "@angular/core";
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { GoogleLoginProvider, SocialAuthServiceConfig } from "@abacritt/angularx-social-login";
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import {HttpLoaderFactory} from "./app.module";
import {provideAnimations} from "@angular/platform-browser/animations";


//Reducers
import {giftCardReducer} from "./kinguin-gift-cards/store/gift-card.reducer";
import {authReducer} from "./state/auth/auth.reducer";

//Effects
import {AuthEffects} from "./state/auth/auth.effects";
import {GiftCardEffects} from "./kinguin-gift-cards/store/gift-card.effects";
import {provideEffects} from "@ngrx/effects";
import {Auth} from "@angular/fire/auth";


// Esta es la función de fábrica para la carga de archivos JSON de traducción.
// export function HttpLoaderFactory(http: HttpClient) {
//   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    provideAnimations(),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider('445500636748-2nuqarr3morlrul9bdadefcogo7rffcn.apps.googleusercontent.com', { oneTapEnabled: false })
          }
        ]
      } as SocialAuthServiceConfig
    },

    provideStore({
      auth: authReducer,
      giftcards: giftCardReducer
    }),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideEffects([
      AuthEffects,
      GiftCardEffects
    ]),
    provideZoneChangeDetection({ eventCoalescing: true }),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
  ],
};
