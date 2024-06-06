import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import {RegisterComponent} from "./register/register.component";
import {NavbarComponent} from "./navbar/navbar.component";
@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RegisterComponent, RouterOutlet, RouterModule, NavbarComponent]
})

export class AppComponent {
  title = 'geekbank-frontend';
}
