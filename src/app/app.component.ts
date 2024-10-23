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

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RegisterComponent, RouterOutlet, RouterModule, NavbarComponent, CommonModule, HttpClientModule, TranslateModule, FooterComponent],
  providers: [ HttpClient]
})

export class AppComponent implements OnInit {
  title = 'geekbank-frontend';
  // constructor(private authService: SocialAuthService, private telegramListenerService: TelegramListenerService) {
  //   this.authService.authState.subscribe((user) => {
  //     // handle user state
  //   });
  // }

  constructor(private translate: TranslateService, private authService: AuthService, private cartService: CartService) {
    // Establece el idioma predeterminado
    this.translate.setDefaultLang('en');
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
