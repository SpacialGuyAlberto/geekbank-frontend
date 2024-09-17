import {Component, EventEmitter, Input, Output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {NgIf} from "@angular/common";
import {UserService} from "../../../../user.service";
import {AuthService} from "../../../../auth.service";
import {response} from "express";

@Component({
  selector: 'app-password-modal',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: 'password-modal-component.component.html',
  styleUrls: ['./password-modal-component.component.css']
})
export class PasswordModalComponent {
  password: string = '';
  isPasswordValid: boolean = false;
  errorMessage: string = '';
  showModal: boolean = true;

  @Output() onConfirm = new EventEmitter<boolean>();
  @Input() user: any = {
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

  constructor(private userService: UserService, private authService: AuthService
  ) { }

  validatePassword(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.authService.validatePassword(this.password).subscribe(
        (response) => {
          if (response.status === 200) {

            resolve(true);  // Retorna true si la respuesta es 200
          } else {
            resolve(false);
          }
        },
        (error) => {
          this.errorMessage = "Your Password is invalid. Please try again.";
          resolve(false);
        }
      );
    });
  }


  async updatePersonalInfo() {

    const isValid = await this.validatePassword()
    if (isValid){
      this.userService.updateDetails(this.password, this.user.email, this.user.phone, this.user.name).subscribe(
        response => {
          console.log('Details updated successfully', response);
          this.closeModal();
        },
        error => {
          console.error('Error updating details', error);
        }
      );
    }

  }

  closeModal() {
    this.onConfirm.emit(false);
  }
}
