import {Component, HostListener, OnInit} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { User } from './User';
import { CommonModule } from '@angular/common';
import {KinguinGiftCard} from "../kinguin-gift-cards/KinguinGiftCard";
import {BackgroundAnimationService} from "../services/background-animation.service";
import {AccountInfoComponent} from "./settings/account-info/account-info.component";
import {OrdersComponent} from "./settings/orders/orders.component";
import {PaymentMethodsComponent} from "./settings/payment-methods/payment-methods.component";
import {AdminPanelComponent} from "../admin-panel/admin-panel.component";
import {Router, RouterOutlet} from "@angular/router";
import {ChangePasswordComponent} from "./settings/account-info/change-password/change-password.component";


@Component({
  selector: 'app-user-details',
  standalone: true,
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
  imports: [CommonModule,
            AdminPanelComponent,
            AccountInfoComponent, OrdersComponent, PaymentMethodsComponent, AdminPanelComponent, RouterOutlet, ChangePasswordComponent]
})
export class UserDetailsComponent implements OnInit {
  user: User | any;

  email: string | undefined;
  selectedSection: string = 'account-info'
  isCollapsed: boolean = false;
  isAccountInfoOpen: boolean = false;
  isSmallScreen: boolean = false;

  constructor(private authService: AuthService,  private router: Router) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isSmallScreen = window.innerWidth <= 768;
  }

  ngOnInit(): void {
    this.authService.getUserDetails().subscribe(data => {
      this.user = data;
      console.log(data.email)
      sessionStorage.setItem("email", data.email)
      console.log(this.user);
    });
    this.selectSection('account-details');
    this.isSmallScreen = window.innerWidth <= 768;

  }

  selectSection(section: string) {
    console.log('Sección seleccionada:', section);  // Verificar la selección
    this.selectedSection = section;
    if (this.isSmallScreen) {
      this.isCollapsed = false;  // Cambiar a false para ocultar el modal
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  navigateToAdminPanel(): void {
    this.router.navigate(['/admin-panel']);
    this.closeSidebarOnMobile();
  }

  toggleAccountInfoSubsections() {
    this.isAccountInfoOpen = !this.isAccountInfoOpen;
  }

  closeSidebarOnMobile() {
    if (this.isSmallScreen) {
      this.isCollapsed = false; // Asegúrate de que se cierra el modal en vista móvil
    }
  }

}
