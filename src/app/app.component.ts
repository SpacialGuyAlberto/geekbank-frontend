import {Component, OnInit} from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import {RegisterComponent} from "./register/register.component";
import {NavbarComponent} from "./navbar/navbar.component";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {SocialAuthService} from "@abacritt/angularx-social-login";
import {CommonModule} from "@angular/common";
import {KinguinGiftCard} from "./models/KinguinGiftCard";
import {KinguinGiftCardsComponent} from "./kinguin-gift-cards/kinguin-gift-cards.component";
import {NgModel} from "@angular/forms";
import {TelegramListenerService} from "./telegram-listener.service";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {FooterComponent} from "./footer/footer.component";
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import {CartItemWithGiftcard} from "./models/CartItem";
// import {loadUserDetails} from "./state/auth/auth.actions";
import {Store} from "@ngrx/store";
import {User} from "./models/User";
import {Observable} from "rxjs";
import {AuthState} from "./state/auth/auth.state";
import {selectUser} from "./state/user/user.selector";
import {selectIsAuthenticated} from "./state/auth/auth.selectors";
import {CookieConsentComponent} from "./cookie-consent/cookie-consent.component";

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    RegisterComponent,
    RouterOutlet,
    RouterModule,
    NavbarComponent,
    CommonModule,
    HttpClientModule,
    TranslateModule,
    FooterComponent,
    CookieConsentComponent
  ],
  providers: [ HttpClient]
})

export class AppComponent implements OnInit {
  title = 'geekbank-frontend';
  isLoggedIn$: Observable<boolean>;
  user$: Observable<User | null>;
  // constructor(private authService: SocialAuthService, private telegramListenerService: TelegramListenerService) {
  //   this.authService.authState.subscribe((user) => {
  //     // handle user state
  //   });
  // }

  constructor(private translate: TranslateService, private authService: AuthService, private cartService: CartService, private store: Store<AuthState>) {
    // Establece el idioma predeterminado
    this.translate.setDefaultLang('en');
    this.isLoggedIn$ = this.store.select(selectIsAuthenticated);
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {
    this.authService.loggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.syncCart();
      }
    });
  }

  // // Método para cambiar el idioma
  // changeLanguage(lang: string) {
  //   this.translate.use(lang);
  // }
  private syncCart(): void {
    const localCart = localStorage.getItem('cart');
    if (localCart) {
      const items: CartItemWithGiftcard[] = JSON.parse(localCart);
      items.forEach(item => {
        this.cartService.addCartItem(item.cartItem.productId, item.cartItem.quantity, item.giftcard.price).subscribe();
      });
      localStorage.removeItem('cart');
      this.cartService.updateCartItemCount();
    }
  }

}
