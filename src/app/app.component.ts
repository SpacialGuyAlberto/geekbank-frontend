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


@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RegisterComponent, RouterOutlet, RouterModule, NavbarComponent, CommonModule],
  providers: [ HttpClientModule, HttpClient

]
})

export class AppComponent implements OnInit {
  title = 'geekbank-frontend';
  // constructor(private authService: SocialAuthService, private telegramListenerService: TelegramListenerService) {
  //   this.authService.authState.subscribe((user) => {
  //     // handle user state
  //   });
  // }

  ngOnInit(): void {
    // The service will start listening as soon as the app initializes
    console.log('AppComponent initialized. Telegram listener service is now active.');
  }

}
