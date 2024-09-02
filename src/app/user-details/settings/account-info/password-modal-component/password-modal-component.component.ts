import {Component, EventEmitter, Input, Output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {NgIf} from "@angular/common";
import {UserService} from "../../../../user.service";

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

  constructor(private userService: UserService) { }

  validatePassword() {
    if (this.password === "hola") {
      this.isPasswordValid = true;
      this.errorMessage = '';
    } else {
      this.isPasswordValid = false;
      this.errorMessage = 'Incorrect password. Please try again.';
    }
  }

  updatePersonalInfo() {
    this.validatePassword();
    if (this.isPasswordValid) {
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
