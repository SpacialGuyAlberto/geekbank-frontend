import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {ChangePasswordComponent} from "./change-password/change-password.component";

@Component({
  selector: 'app-account-info',
  standalone: true,
  imports: [
    FormsModule,
    ChangePasswordComponent
  ],
  templateUrl: './account-info.component.html',
  styleUrl: './account-info.component.css'
})
export class AccountInfoComponent {
  user: any = {
    name: '',
    email: '',
    phone: '',
    addresses: [],
    paymentMethods: [],
    preferences: {
      promotions: true,
      orderUpdates: true
    }
  };

  private _address: any;
  private _payment: any;

  updatePersonalInfo() {
    // Lógica para actualizar la información personal del usuario
  }


  editAddress(address: any) {
    this._address = address;
    // Lógica para editar la dirección seleccionada
  }

  deleteAddress(address: any) {
    this._address = address;
    // Lógica para eliminate la dirección seleccionada
  }

  addNewAddress() {
    // Lógica para añadir una nueva dirección
  }

  editPaymentMethod(payment: any) {
    this._payment = payment;
    // Lógica para editar el método de pago seleccionado
  }

  deletePaymentMethod(payment: any) {
    this._payment = payment;
    // Lógica para eliminar el método de pago seleccionado
  }

  addNewPaymentMethod() {
    // Lógica para añadir un nuevo método de pago
  }

  updateCommunicationPreferences() {
    // Lógica para actualizar las preferencias de comunicación del usuario
  }
}

