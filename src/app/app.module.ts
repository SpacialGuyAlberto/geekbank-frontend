import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {BrowserAnimationsModule, provideAnimations} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from "@angular/forms";
import { RegisterComponent } from './register/register.component';
import {LoginComponent} from "./login/login.component";
import {AppRoutingModule} from "./app-routing.module";
import {environment} from "../environment";
import {SocialLoginModule,   SocialAuthServiceConfig} from '@abacritt/angularx-social-login';
import { GoogleLoginProvider } from '@abacritt/angularx-social-login';
import {TelegramListenerService} from "./telegram-listener.service";
import {CartComponent} from "./cart/cart.component";
import {MetaReducer, StoreModule} from '@ngrx/store';

import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import {TransactionsComponent} from "./user-details/admin-panel/transactions/transactions.component";
import {AccountInfoComponent} from "./user-details/settings/account-info/account-info.component";
import {ChangePasswordComponent} from "./user-details/settings/account-info/change-password/change-password.component";
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {  provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {AuthInterceptor} from "./auth.interceptor";


//Reducers
import {authReducer} from "./state/auth/auth.reducer";
import { cartReducer } from './store/cart/cart.reducer';
import {giftCardReducer} from "./kinguin-gift-cards/store/gift-card.reducer";
//Effects
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
    HttpClient,
    TelegramListenerService,
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
