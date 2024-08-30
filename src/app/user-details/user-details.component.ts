import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { User } from '../models/User';
import { CommonModule } from '@angular/common';
import {KinguinGiftCard} from "../models/KinguinGiftCard";
import {AdminPanelComponent} from "../admin-panel/admin-panel.component";
import {BackgroundAnimationService} from "../background-animation.service";
import {SettingsComponent} from "./settings/settings.component";
import {AccountInfoComponent} from "./settings/account-info/account-info.component";
import {OrdersComponent} from "./settings/orders/orders.component";
import {PaymentMethodsComponent} from "./settings/payment-methods/payment-methods.component";


@Component({
  selector: 'app-user-details',
  standalone: true,
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
  imports: [CommonModule, AdminPanelComponent, SettingsComponent, AccountInfoComponent, OrdersComponent, PaymentMethodsComponent]
})
export class UserDetailsComponent implements OnInit {
  user: User | any;
  email: string | undefined;
  currentSection: string = 'clients';

  constructor(private authService: AuthService, private animation: BackgroundAnimationService) {}

  ngOnInit(): void {
    this.animation.initializeGraphAnimation();
    this.authService.getUserDetails().subscribe(data => {
      this.user = data;
      console.log(data.email)
      sessionStorage.setItem("email", data.email)
    });
    this.selectSection('products');

  }



  selectSection(section: string) {
    this.currentSection = section;
  }
}
