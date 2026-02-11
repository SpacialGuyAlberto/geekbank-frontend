import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";
import {Account, User} from "../user-details/User";


@Component({
    selector: 'app-auth-modal',
    templateUrl: './auth-modal.component.html',
    imports: [
        FormsModule,
        NgIf
    ],
    styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() authenticated = new EventEmitter<void>();

  showLoginForm: boolean = false;
  showRegisterForm: boolean = false;
  authToken: string = '';
  loginData = {
    email: '',
    password: ''
  };

  registerData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  loginError: string = '';
  registerError: string = '';

  constructor(private authService: AuthService) {}

  toggleLogin(): void {
    this.showLoginForm = true;
    this.showRegisterForm = false;
    this.loginError = '';
  }

  toggleRegister(): void {
    this.showRegisterForm = true;
    this.showLoginForm = false;
    this.registerError = '';
  }

  onClose(): void {
    this.close.emit();
  }

  onLogin(): void {
    this.authService.login(this.loginData.email, this.loginData.password).subscribe({
      next: () => {
        this.authenticated.emit();
        this.onClose();
      },
      error: (err) => {
        this.loginError = err.error?.message || 'Error al iniciar sesión. Por favor, inténtelo nuevamente.';
      }
    });
  }

  onRegister() {

  }
}
