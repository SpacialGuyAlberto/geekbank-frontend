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
import {loadUserFromSession} from "./state/auth/auth.actions";
import {VisitService} from "./visit.service";

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
  isLoggedIn$: Observable<boolean | null>;
  user$: Observable<User | null>;
  visitCount: number = 0;
  sessionId: string = '';


  constructor(
    private translate: TranslateService,
    private authService: AuthService,
    private cartService: CartService,
    private store: Store<AuthState>,
    private visitService: VisitService
    ) {
    // Establece el idioma predeterminado
    this.translate.setDefaultLang('en');
    this.isLoggedIn$ = this.store.select(selectIsAuthenticated);
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {
    this.store.dispatch(loadUserFromSession());
    this.initializeSession();
    this.registerVisit();
    this.getVisitCount();
    // this.authService.loggedIn$.subscribe(isLoggedIn => {
    //   if (isLoggedIn) {
    //     this.syncCart();
    //   }
    // });
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

  initializeSession() {
    const storedSessionId = sessionStorage.getItem('sessionId');
    if (storedSessionId) {
      this.sessionId = storedSessionId;
    } else {
      this.sessionId = this.generateSessionId();
      sessionStorage.setItem('sessionId', this.sessionId);
    }
  }

  generateSessionId(): string {
    // Genera un ID único, por ejemplo, usando UUID
    return 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  registerVisit() {
    this.visitService.registerVisit(this.sessionId).subscribe(() => {
      console.log('Visita registrada');
    }, error => {
      console.error('Error al registrar la visita', error);
    });
  }

  getVisitCount() {
    this.visitService.getVisitCount().subscribe(count => {
      this.visitCount = count;
    }, error => {
      console.error('Error al obtener el conteo de visitas', error);
    });
  }


}
