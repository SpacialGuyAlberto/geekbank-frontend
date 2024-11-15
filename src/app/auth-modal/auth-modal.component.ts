// src/app/auth-modal/auth-modal.component.ts

import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../auth.service';
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  standalone: true,
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
      next: (data) => {
        this.authenticated.emit();
        this.onClose();
        sessionStorage.setItem('token', data.headers.get('Authorization'));
        console.log(sessionStorage.getItem('token'))
      },
      error: (err) => {
        this.loginError = err.error?.message || 'Error al iniciar sesión. Por favor, inténtelo nuevamente.';
      }
    });

    // this.authService.login(this.loginData.email, this.loginData.password).subscribe( (data) => {
    //   this.authToken = data.auth.token;
    //   sessionStorage.setItem('token', this.authToken);
    //   this.authenticated.emit();
    //   this.onClose();
    // })
  }

  // onRegister(): void {
  //   if (this.registerData.password !== this.registerData.confirmPassword) {
  //     this.registerError = 'Las contraseñas no coinciden.';
  //     return;
  //   }
  //
  //   this.authService.register(this.registerData).subscribe({
  //     next: () => {
  //       this.authenticated.emit();
  //       this.onClose();
  //     },
  //     error: (err) => {
  //       this.registerError = err.error?.message || 'Error al crear la cuenta. Por favor, inténtelo nuevamente.';
  //     }
  //   });
  // }
  onRegister() {
    console.log("registering");
  }
}
