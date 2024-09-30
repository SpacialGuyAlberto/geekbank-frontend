import {Component, Input} from '@angular/core';
import { FormsModule } from "@angular/forms";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {PasswordModalComponent} from "./password-modal-component/password-modal-component.component";

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
  ],
  templateUrl: './account-info.component.html',
  styleUrl: './account-info.component.css'
})
export class AccountInfoComponent {

  @Input()
  user: any = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    balance: 350.75,  // Añadiendo el balance
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

  selectedSection: string = 'account-details';
  isAccountInfoOpen: boolean = false;
  showSuccessMessage: boolean = false;
  isPasswordModalOpen: boolean = false;

  editingName = false;
  editingEmail = false;
  editingPhone = false;


  private _address: any;
  private _payment: any;

  updatePersonalInfo() {
    if (this.validateName(this.user.name) && this.validateEmail(this.user.email) && this.validatePhone(this.user.phone)) {
      this.showSuccessMessage = true;
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 5000);
      console.log('Personal information is valid and updated.');
    } else {
      console.log('Validation failed.');
    }
  }

  toggleEdit(field: string) {
    if (field === 'name') {
      this.editingName = !this.editingName;
    } else if (field === 'email') {
      this.editingEmail = !this.editingEmail;
    } else if (field === 'phone') {
      this.editingPhone = !this.editingPhone;
    }
  }

  openPasswordModal() {
    if (this.validateName(this.user.name) && this.validateEmail(this.user.email) && this.validatePhone(this.user.phone)) {
      this.isPasswordModalOpen = true;
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 5000);
      console.log('Personal information is valid and updated.');
    } else {
      console.log('Validation failed.');
    }
  }



  handlePasswordConfirmation(isConfirmed: boolean) {
    this.isPasswordModalOpen = false;
    this.showSuccessMessage = true;
    if (isConfirmed) {
      this.updatePersonalInfo();
    }
  }

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

  editAddress(address: any) {
    this._address = address;

  }

  deleteAddress(address: any) {
    this._address = address;

  }

  addNewAddress() {

  }

  editPaymentMethod(payment: any) {
    this._payment = payment;

  }

  deletePaymentMethod(payment: any) {
    this._payment = payment;

  }

  addNewPaymentMethod() {

  }

  updateCommunicationPreferences() {

  }

  toggleAccountInfoSubsections() {
    this.isAccountInfoOpen = !this.isAccountInfoOpen;
  }

  selectSection(section: string) {
    this.selectedSection = section;
  }


}
