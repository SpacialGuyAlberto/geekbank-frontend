// password-modal-component.component.ts

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from "@angular/common";
import { UserService } from "../../../user.service";
import { AuthService } from "../../../../services/auth.service";
import { User } from "../../../User";
import { DetailsBody } from "../account-info.component";
import {NotificationService} from "../../../../services/notification.service";
import {MatSnackBarModule, MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-password-modal',
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
  imageurl: string = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

  @Output() onConfirm = new EventEmitter<boolean>();
  @Input() user: User | any;
  @Input() detailsBody: DetailsBody | any;

  constructor(private userService: UserService, private authService: AuthService, private notificationService: NotificationService,  private snackBar: MatSnackBar,) { }

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

          this.isLoading = false;
          this.onConfirm.emit(true);
          this.notificationService.addNotification('Your information was succesfully updated', 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png')
          this.showSnackBar('Information updated succesfully.');
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

  showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }
}
