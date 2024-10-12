// account-info.component.ts

import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf } from "@angular/common";
import { PasswordModalComponent } from "./password-modal-component/password-modal-component.component";
import { PaymentMethodsComponent } from "../payment-methods/payment-methods.component";
import { StatisticsComponent } from "../../admin-panel/statistics/statistics.component";
import { ProductsComponent } from "../../admin-panel/products/products.component";
import { OrdersComponent } from "../orders/orders.component";
import { AuthService } from "../../../auth.service";
import { BackgroundAnimationService } from "../../../background-animation.service";
import { NavigationEnd, Router, RouterModule } from "@angular/router";
import { WishlistComponent } from "../wishlist/wishlist.component";
import { Subscription } from "rxjs";
import { SharedService } from "../../../shared.service";
import { filter } from "rxjs/operators";

export interface DetailsBody {
  name?: string;
  email?: string;
  phoneNumber?: string; // Asegúrate de usar 'phoneNumber'
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
    addresses: [
      { street: '123 Main St', city: 'New York' },
      { street: '456 Oak St', city: 'San Francisco' }
    ],
    paymentMethods: [
      { type: 'Visa', lastFourDigits: '4242' },
      { type: 'MasterCard', lastFourDigits: '1234' }
    ],
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

  constructor(
    private authService: AuthService,
    private router: Router,
    private sharedService: SharedService
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isSmallScreen = window.innerWidth <= 768;
  }

  ngOnInit(): void {
    this.authService.getUserDetails().subscribe(data => {
      this.user = data;
      this.balance = data.account.balance;
      this.user.phone = data.phoneNumber;
      sessionStorage.setItem('currentUserEmail', this.user.email);

      this.controlSubscription = this.sharedService.selectedTable$.subscribe(tab => {
        this.selectedTab = tab;
      });
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo(0, 0);  // Desplazarse al tope de la página
    });

    this.isSmallScreen = window.innerWidth <= 768;
  }

// account-info.component.ts

  async updatePersonalInfo() {
    this.validationErrors = {};
    this.generalErrorMessage = '';

    let isValid = true;
    let updatedFields: DetailsBody = {email: "", name: "", phoneNumber: ""};

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
      console.log('Información personal válida y lista para actualizar.');
    } else if (isValid && Object.keys(updatedFields).length === 0) {
      this.generalErrorMessage = 'No hay cambios para actualizar.';
      console.log('No hay cambios para actualizar.');
    } else {
      this.generalErrorMessage = 'Por favor, corrige los errores en el formulario.';
      console.log('Validación fallida.');
    }

    console.log('Details Body: ' + JSON.stringify(this.detailsBody));
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
    // Implementa la lógica para cerrar el componente
  }

  // Función para seleccionar la pestaña
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
      console.log('Name after editing: ' + this.detailsBody.name)
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

  editAddress(address: any) {
    console.log('Editar dirección:', address);
  }

  deleteAddress(address: any) {
    this.user.addresses = this.user.addresses.filter((a: any) => a !== address);
    console.log('Dirección eliminada:', address);
  }

  addNewAddress() {
    const newAddress = { street: 'Nueva Calle', city: 'Nueva Ciudad' };
    this.user.addresses.push(newAddress);
    console.log('Nueva dirección agregada:', newAddress);
  }

  editPaymentMethod(payment: any) {
    console.log('Editar método de pago:', payment);
  }

  deletePaymentMethod(payment: any) {
    this.user.paymentMethods = this.user.paymentMethods.filter((p: any) => p !== payment);
    console.log('Método de pago eliminado:', payment);
  }

  addNewPaymentMethod() {
    const newPayment = { type: 'Amex', lastFourDigits: '5678' };
    this.user.paymentMethods.push(newPayment);
    console.log('Nuevo método de pago agregado:', newPayment);
  }

  updateCommunicationPreferences() {
    console.log('Preferencias de comunicación actualizadas:', this.user.preferences);
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 5000);
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
      this.isCollapsed = false; // Asegúrate de que se cierra el modal en vista móvil
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (this.showPasswordModal) {
      this.showPasswordModal = false;
    }
  }
}
