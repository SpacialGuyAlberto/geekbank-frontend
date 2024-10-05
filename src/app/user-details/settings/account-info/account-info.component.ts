import {Component, HostListener, Input, OnInit} from '@angular/core';
import { FormsModule } from "@angular/forms";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {PasswordModalComponent} from "./password-modal-component/password-modal-component.component";
import {PaymentMethodsComponent} from "../payment-methods/payment-methods.component";
import {StatisticsComponent} from "../../admin-panel/statistics/statistics.component";
import {ProductsComponent} from "../../admin-panel/products/products.component";
import {OrdersComponent} from "../orders/orders.component";
import {AuthService} from "../../../auth.service";
import {BackgroundAnimationService} from "../../../background-animation.service";
import {Router} from "@angular/router";

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
  ],
  templateUrl: './account-info.component.html',
  styleUrl: './account-info.component.css'
})


export class AccountInfoComponent implements OnInit {

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
  isCollapsed: boolean = false;
  isSmallScreen: boolean = false;


  selectedTab: string = 'details';
  showSuccessMessage: boolean = false;

  editingName = false;
  editingEmail = false;
  editingPhone = false;

  private _address: any;
  private _payment: any;

  constructor(private authService: AuthService, private animation: BackgroundAnimationService,  private router: Router) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isSmallScreen = window.innerWidth <= 768;
  }

  ngOnInit(): void {
    this.animation.initializeGraphAnimation();
    this.authService.getUserDetails().subscribe(data => {
      this.user = data;
      console.log(data.email)
      sessionStorage.setItem("email", data.email)
      console.log(this.user);
    });
    // this.selectSection('account-details');
    this.isSmallScreen = window.innerWidth <= 768;

  }

  // Función para seleccionar la pestaña
  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  // Funciones para editar campos
  toggleEdit(field: string) {
    if (field === 'name') {
      this.editingName = !this.editingName;
    } else if (field === 'email') {
      this.editingEmail = !this.editingEmail;
    } else if (field === 'phone') {
      this.editingPhone = !this.editingPhone;
    }
  }

  // Función para actualizar información personal
  updatePersonalInfo() {
    if (this.validateName(this.user.name) && this.validateEmail(this.user.email) && this.validatePhone(this.user.phone)) {
      this.showSuccessMessage = true;
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 5000);
      console.log('Información personal válida y actualizada.');
    } else {
      console.log('Validación fallida.');
    }
  }

  // Funciones para direcciones
  editAddress(address: any) {
    // Implementar lógica de edición
    console.log('Editar dirección:', address);
  }

  deleteAddress(address: any) {
    // Implementar lógica de eliminación
    this.user.addresses = this.user.addresses.filter((a: any) => a !== address);
    console.log('Dirección eliminada:', address);
  }

  addNewAddress() {
    // Implementar lógica para agregar una nueva dirección
    const newAddress = { street: 'Nueva Calle', city: 'Nueva Ciudad' };
    this.user.addresses.push(newAddress);
    console.log('Nueva dirección agregada:', newAddress);
  }

  // Funciones para métodos de pago
  editPaymentMethod(payment: any) {
    // Implementar lógica de edición
    console.log('Editar método de pago:', payment);
  }

  deletePaymentMethod(payment: any) {
    // Implementar lógica de eliminación
    this.user.paymentMethods = this.user.paymentMethods.filter((p: any) => p !== payment);
    console.log('Método de pago eliminado:', payment);
  }

  addNewPaymentMethod() {
    // Implementar lógica para agregar un nuevo método de pago
    const newPayment = { type: 'Amex', lastFourDigits: '5678' };
    this.user.paymentMethods.push(newPayment);
    console.log('Nuevo método de pago agregado:', newPayment);
  }

  // Función para actualizar preferencias de comunicación
  updateCommunicationPreferences() {
    // Implementar lógica para actualizar preferencias
    console.log('Preferencias de comunicación actualizadas:', this.user.preferences);
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 5000);
  }

  // Validaciones
  validateName(name: string): boolean {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name);
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePhone(phone: string): boolean {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phone);
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
}
