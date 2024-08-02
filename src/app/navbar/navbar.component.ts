import {Component, Input, OnInit} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { NgIf } from '@angular/common';
import {MatIconModule} from "@angular/material/icon";
import {CartService} from "../cart.service";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    MatIconModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})


export class NavbarComponent implements OnInit {

  cartItemCount: number = 0;
  dummyCount: string | null= localStorage.getItem('cartItemCount');
  constructor(private authService: AuthService, protected router: Router, protected cartService: CartService) {}

  ngOnInit(): void {
    // this.cartService.cartItemCount$.subscribe(count => {
    //   this.cartItemCount = count;
    // });
    // this.loadCartItemCount()
    this.cartService.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;
    });
  }

  onCartItemCountChange(count: number) {
    this.cartItemCount = count;
  }

  loadCartItemCount(): void {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItemCount = items.reduce((count, item) => count + 1, 0)
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  async logout() {
    await this.authService.performLogout(this.router);
  }
}
