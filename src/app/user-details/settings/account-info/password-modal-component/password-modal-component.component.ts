// password-modal-component.component.ts

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from "@angular/common";
import { UserService } from "../../../../user.service";
import { AuthService } from "../../../../auth.service";
import { User } from "../../../../models/User";
import { DetailsBody } from "../account-info.component";

@Component({
  selector: 'app-password-modal',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './password-modal-component.component.html',
  styleUrls: ['./password-modal-component.component.css']
})
// password-modal-component.component.ts

export class PasswordModalComponent {
  password: string = '';
  errorMessage: string = '';
  showModal: boolean = true;
  isLoading: boolean = false;

  @Output() onConfirm = new EventEmitter<boolean>();
  @Input() user: User | any;
  @Input() detailsBody: DetailsBody | any;

  constructor(private userService: UserService, private authService: AuthService) { }

  validatePassword(): Promise<boolean> {
    return new Promise((resolve) => {
      this.authService.validatePassword(this.password).subscribe(
        (response) => {
          if (response.status === 200) {
            resolve(true);
          } else {
            this.errorMessage = "Tu contraseña es inválida. Por favor, intenta de nuevo.";
            resolve(false);
          }
        },
        (error) => {
          this.errorMessage = "Tu contraseña es inválida. Por favor, intenta de nuevo.";
          resolve(false);
        }
      );
    });
  }

  async updatePersonalInfo() {
    this.errorMessage = '';
    this.isLoading = true;
    const isValid = await this.validatePassword();
    if (isValid) {
      this.detailsBody.password = this.password;

      this.userService.updateDetails(this.detailsBody).subscribe(
        response => {
          console.log('Detalles actualizados exitosamente', response);
          this.isLoading = false;
          this.onConfirm.emit(true);
        },
        error => {
          console.error('Error al actualizar los detalles', error);
          if (error.error && error.error.error) {
            this.errorMessage = error.error.error;
          } else {
            this.errorMessage = "Error al actualizar la información. Inténtalo de nuevo.";
          }
          this.isLoading = false;
        }
      );
    } else {
      this.isLoading = false;
    }
  }

  closeModal() {
    this.onConfirm.emit(false); // Emitir evento de cancelación
  }
}
