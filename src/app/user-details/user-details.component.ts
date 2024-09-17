import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { User } from '../models/User';
import { CommonModule } from '@angular/common';
import {KinguinGiftCard} from "../models/KinguinGiftCard";
import {BackgroundAnimationService} from "../background-animation.service";
import {SettingsComponent} from "./settings/settings.component";
import {AccountInfoComponent} from "./settings/account-info/account-info.component";
import {OrdersComponent} from "./settings/orders/orders.component";
import {PaymentMethodsComponent} from "./settings/payment-methods/payment-methods.component";
import {AdminPanelComponent} from "./admin-panel/admin-panel.component";
import {Router, RouterOutlet} from "@angular/router";
import {ChangePasswordComponent} from "./settings/account-info/change-password/change-password.component";


@Component({
  selector: 'app-user-details',
  standalone: true,
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
  imports: [CommonModule, AdminPanelComponent, SettingsComponent, AccountInfoComponent, OrdersComponent, PaymentMethodsComponent, AdminPanelComponent, RouterOutlet, ChangePasswordComponent]
})
export class UserDetailsComponent implements OnInit {
  user: User | any;
  email: string | undefined;
  selectedSection: string = 'account-info'
  isCollapsed: boolean = false;
  isAccountInfoOpen: boolean = false;

  constructor(private authService: AuthService, private animation: BackgroundAnimationService,  private router: Router) {}

  ngOnInit(): void {
    this.animation.initializeGraphAnimation();
    this.authService.getUserDetails().subscribe(data => {
      this.user = data;
      console.log(data.email)
      sessionStorage.setItem("email", data.email)
      console.log(this.user);
    });
    this.selectSection('products');

  }


  selectSection(section: string) {
    this.selectedSection = section;
    if (window.innerWidth <= 768) {
      // Si está en móvil, colapsa el menú automáticamente al seleccionar una sección
      this.isCollapsed = true;
    }
  }
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  navigateToAdminPanel(): void {
    this.router.navigate(['/admin-panel']);
  }
  toggleAccountInfoSubsections() {
    this.isAccountInfoOpen = !this.isAccountInfoOpen;
    // Si las subsecciones están abiertas, selecciona 'account-info' por defecto
    if (!this.isAccountInfoOpen) {
      this.selectedSection = 'account-info';
    }
  }
}
