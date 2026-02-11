// password-modal-component.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import {FormsModule} from "@angular/forms";

@Component({
    selector: 'app-password-modal',
    templateUrl: './password-modal.component.html',
    imports: [
        FormsModule
    ],
    styleUrls: ['./password-modal.component.css']
})
export class PasswordModalComponent {
  @Output() passwordSubmitted = new EventEmitter<string | null>();
  password: string = '';

  submitPassword() {
    if (this.password.trim()) {
      this.passwordSubmitted.emit(this.password);
      this.password = ''; // Limpiar el campo después de emitir
    } else {
      // Aquí podrías agregar validaciones o mensajes de error
      alert('Por favor, ingresa tu contraseña.');
    }
  }

  closeModal() {
    // Emitir un evento o manejar el cierre del modal si es necesario
    this.passwordSubmitted.emit(null);
  }
}
