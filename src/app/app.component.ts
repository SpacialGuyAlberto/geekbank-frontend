import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import {RegisterComponent} from "./register/register.component";
import {NavbarComponent} from "./navbar/navbar.component";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {SocialAuthService} from "@abacritt/angularx-social-login";

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RegisterComponent, RouterOutlet, RouterModule, NavbarComponent],
  providers: [ HttpClientModule, HttpClient

]
})

export class AppComponent {
  title = 'geekbank-frontend';
  constructor(private authService: SocialAuthService) {
    this.authService.authState.subscribe((user) => {
      // handle user state
    });
  }

}
