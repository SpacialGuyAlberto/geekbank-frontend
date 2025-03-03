import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {BrowserAnimationsModule, provideAnimations} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from "@angular/forms";
import {AppRoutingModule} from "./app-routing.module";
import {SocialLoginModule,} from '@abacritt/angularx-social-login';
import { StoreModule} from '@ngrx/store';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {  provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {AuthInterceptor} from "./services/auth.interceptor";
import { CookieService } from 'ngx-cookie-service';
import {authReducer} from "./state/auth/auth.reducer";
import { cartReducer } from './store/cart/cart.reducer';
import {giftCardReducer} from "./kinguin-gift-cards/store/gift-card.reducer";
import {AuthEffects} from "./state/auth/auth.effects";
import {EffectsModule} from "@ngrx/effects";
import {GiftCardEffects} from "./kinguin-gift-cards/store/gift-card.effects";



export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatButtonModule,
    SocialLoginModule,
    NoopAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    StoreModule.forRoot({
      auth: authReducer,
      cart: cartReducer,
      giftcards: giftCardReducer
    }, ),
    EffectsModule.forRoot([
      AuthEffects,
      GiftCardEffects,
    ]),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })

    // StoreModule.forFeature('cart', cartReducer),
    // StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production })
  ],
  providers: [
    CookieService,
    HttpClient,
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
})
export class AppModule { }

// export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
//   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }
