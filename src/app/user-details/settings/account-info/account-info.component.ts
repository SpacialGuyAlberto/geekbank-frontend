import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf } from "@angular/common";
import { PasswordModalComponent } from "./password-modal-component/password-modal-component.component";
import { PaymentMethodsComponent } from "../payment-methods/payment-methods.component";
import { StatisticsComponent } from "../../../statistics/statistics.component";
import { ProductsComponent } from "../../../products/products.component";
import { OrdersComponent } from "../orders/orders.component";
import { AuthService } from "../../../services/auth.service";
import { NavigationEnd, Router, RouterModule } from "@angular/router";
import { WishlistComponent } from "../wishlist/wishlist.component";
import { Observable, of, Subscription } from "rxjs";
import { SharedService } from "../../../services/shared.service";
import { filter } from "rxjs/operators";

import { Store } from "@ngrx/store";
import { selectUser, selectIsAuthenticated } from "../../../state/auth/auth.selectors";
import { AppState } from "../../../app.state";
import { User } from "../../User";
import { UserService } from '../../user.service';

export interface DetailsBody {
  name?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
}

@Component({
  selector: 'app-account-info',
  standalone: true,
  imports: [
    FormsModule,
    ChangePasswordComponent,
    NgClass,
    NgForOf,
    PasswordModalComponent,
    NgIf,
    DatePipe,
    CurrencyPipe,
    PaymentMethodsComponent,
    StatisticsComponent,
    ProductsComponent,
    OrdersComponent,
    WishlistComponent,
    RouterModule
  ],
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.css']
})
export class AccountInfoComponent implements OnInit, OnDestroy {
  isVisible: boolean = false;
  private controlSubscription!: Subscription;

  @Input()
  user: any = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    balance: 350.75,
    addresses: [],
    paymentMethods: [],
    preferences: {
      promotions: true,
      orderUpdates: true
    }
  };
  balance: number = 0;
  isCollapsed: boolean = false;
  isSmallScreen: boolean = false;
  showPasswordModal: boolean = false;
  selectedTab: string = 'details';
  showSuccessMessage: boolean = false;
  generalErrorMessage: string = '';
  detailsBody: DetailsBody = {
    name: '',
    email: '',
    phoneNumber: '',
  };

  validationErrors: {
    name?: string;
    email?: string;
    phoneNumber?: string;
  } = {};

  editingName = false;
  editingEmail = false;
  editingPhone = false;

  user$: Observable<User | null> = of(null);
  isAuthenticated$: Observable<boolean | null> = of(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private sharedService: SharedService,
    private store: Store<AppState>,
    private userService: UserService
  ) { }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isSmallScreen = window.innerWidth <= 768;
  }

  ngOnInit(): void {
    this.authService.getUserDetails().subscribe(data => {
      this.user = data;
      this.balance = data.account.balance;
      this.user.phone = data.phoneNumber;

      // Initialize arrays if they don't exist
      if (!this.user.addresses) this.user.addresses = [];
      if (!this.user.paymentOptions) this.user.paymentOptions = [];

      // Initialize preferences from user data
      this.user.preferences = {
        promotions: this.user.receivePromotions ?? true,
        orderUpdates: this.user.receiveOrderUpdates ?? true
      };

      sessionStorage.setItem('currentUserEmail', this.user.email);

      this.controlSubscription = this.sharedService.selectedTable$.subscribe(tab => {
        this.selectedTab = tab;
      });
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo(0, 0);
    });

    this.isSmallScreen = window.innerWidth <= 768;

    this.user$ = this.store.select(selectUser);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.isAuthenticated$.subscribe(value => { })
  }

  deleteAccount() {
    if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      this.userService.deleteUser(this.user.id).subscribe({
        next: () => {
          alert('Tu cuenta ha sido eliminada.');
          this.authService.logout();
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Error eliminando cuenta', err);
          this.generalErrorMessage = 'Error al eliminar la cuenta. Por favor intenta más tarde.';
        }
      });
    }
  }

  async updatePersonalInfo() {
    this.validationErrors = {};
    this.generalErrorMessage = '';

    let isValid = true;
    let updatedFields: DetailsBody = { email: "", name: "", phoneNumber: "" };

    if (this.editingName) {
      const isNameValid = this.validateName(this.detailsBody.name);
      if (!isNameValid) {
        this.validationErrors.name = 'El nombre solo debe contener letras y espacios.';
        isValid = false;
      } else {
        updatedFields.name = this.detailsBody.name;
      }
    }

    if (this.editingEmail) {
      const isEmailValid = this.validateEmail(this.detailsBody.email);
      if (!isEmailValid) {
        this.validationErrors.email = 'Por favor, ingresa una dirección de correo electrónico válida.';
        isValid = false;
      } else {
        updatedFields.email = this.detailsBody.email;
      }
    }

    if (this.editingPhone) {
      const isPhoneValid = this.validatePhone(this.detailsBody.phoneNumber);
      if (!isPhoneValid) {
        this.validationErrors.phoneNumber = 'El teléfono debe tener entre 10 y 15 dígitos numéricos.';
        isValid = false;
      } else {
        updatedFields.phoneNumber = this.detailsBody.phoneNumber;
      }
    }

    if (isValid && Object.keys(updatedFields).length > 0) {
      this.showPasswordModal = true;

    } else if (isValid && Object.keys(updatedFields).length === 0) {
      this.generalErrorMessage = 'No hay cambios para actualizar.';

    } else {
      this.generalErrorMessage = 'Por favor, corrige los errores en el formulario.';

    }


  }


  handlePasswordModalResponse(success: boolean) {
    if (success) {
      this.showPasswordModal = false;
      this.showSuccessMessage = true;
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);

    } else {
      this.showPasswordModal = false;
    }
  }

  ngOnDestroy(): void {
    if (this.controlSubscription) {
      this.controlSubscription.unsubscribe();
    }
  }

  openAccountInfo(): void {
    this.isVisible = true;
    console.log('Account Info abierto desde navbar');
  }

  closeAccountInfo(): void {
    this.isVisible = false;
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  toggleEdit(field: string) {
    if (field === 'name') {
      this.editingName = !this.editingName;
      if (this.editingName) {
        this.detailsBody.name = this.user.name;
      } else {
        this.user.name = this.detailsBody.name
        this.detailsBody.name = this.user.name = this.detailsBody.name;
      }
      if (this.validationErrors.name) {
        delete this.validationErrors.name;
      }
    } else if (field === 'email') {
      this.editingEmail = !this.editingEmail;
      if (this.editingEmail) {
        this.detailsBody.email = this.user.email;
      } else {
        this.user.email = this.detailsBody.email;
        this.detailsBody.email = this.user.email = this.detailsBody.email;
      }
      if (this.validationErrors.email) {
        delete this.validationErrors.email;
      }
    } else if (field === 'phone') {
      this.editingPhone = !this.editingPhone;
      if (this.editingPhone) {
        this.detailsBody.phoneNumber = this.user.phone;
      } else {
        this.user.phone = this.detailsBody.phoneNumber;
        this.detailsBody.phoneNumber = this.user.phone = this.detailsBody.phoneNumber;
      }
      if (this.validationErrors.phoneNumber) {
        delete this.validationErrors.phoneNumber;
      }
    }
  }

  // Address Management
  addNewAddress() {
    const street = prompt('Ingrese la calle:');
    const city = prompt('Ingrese la ciudad:');
    const country = prompt('Ingrese el país:', 'USA'); // Default
    const zipCode = prompt('Ingrese el código postal:');

    if (street && city && country && zipCode) {
      const newAddress = { street, city, country, zipCode };
      this.userService.addAddress(this.user.id, newAddress).subscribe({
        next: (updatedUser: any) => {
          this.user.addresses = updatedUser.addresses;
        },
        error: (err) => console.error('Error adding address', err)
      });
    }
  }

  deleteAddress(address: any) {
    if (confirm('¿Eliminar esta dirección?')) {
      this.userService.removeAddress(this.user.id, address.id).subscribe({
        next: (updatedUser: any) => {
          this.user.addresses = updatedUser.addresses;
        },
        error: (err) => console.error('Error removing address', err)
      });
    }
  }

  editAddress(address: any) {
    // For simplicity, reusing prompt or just alerting
    alert('Edición de dirección no implementada completamente. Elimine y cree una nueva.');
  }

  // Payment Management
  addNewPaymentMethod() {
    const type = prompt('Tipo de tarjeta (VISA, MASTERCARD, PAYPAL):');
    const lastFourDigits = prompt('Últimos 4 dígitos:', '1234');
    const provider = prompt('Proveedor (Bank Name, etc):', 'Generic Bank');

    if (type && lastFourDigits && provider) {
      const newPayment = { type, lastFourDigits, provider };
      this.userService.addPaymentOption(this.user.id, newPayment).subscribe({
        next: (updatedUser: any) => {
          this.user.paymentOptions = updatedUser.paymentOptions;
        },
        error: (err) => console.error('Error adding payment option', err)
      });
    }
  }

  deletePaymentMethod(payment: any) {
    if (confirm('¿Eliminar este método de pago?')) {
      this.userService.removePaymentOption(this.user.id, payment.id).subscribe({
        next: (updatedUser: any) => {
          this.user.paymentOptions = updatedUser.paymentOptions;
        },
        error: (err) => console.error('Error removing payment option', err)
      });
    }
  }

  editPaymentMethod(payment: any) {
    alert('Edición de método de pago no implementada. Elimine y agregue de nuevo.');
  }

  // Preferences
  updateCommunicationPreferences() {
    this.userService.updatePreferences(this.user.id, {
      receivePromotions: this.user.preferences.promotions,
      receiveOrderUpdates: this.user.preferences.orderUpdates
    }).subscribe({
      next: (updatedUser: any) => {
        this.showSuccessMessage = true;
        setTimeout(() => this.showSuccessMessage = false, 3000);
      },
      error: (err) => console.error('Error updating preferences', err)
    });
  }

  // Validaciones
  validateName(name: string | undefined): boolean {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(<string>name);
  }

  validateEmail(email: string | undefined): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(<string>email);
  }

  validatePhone(phone: string | undefined): boolean {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(<string>phone);
  }

  navigateToAdminPanel(): void {
    this.router.navigate(['/admin-panel']);
    this.closeSidebarOnMobile();
  }

  closeSidebarOnMobile() {
    if (this.isSmallScreen) {
      this.isCollapsed = false;
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (this.showPasswordModal) {
      this.showPasswordModal = false;
    }
  }
}
