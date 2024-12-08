import {Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {HttpClientModule, HttpResponse} from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { AuthService } from '../auth.service';
import {BackgroundAnimationService} from "../background-animation.service";
import {After} from "node:v8";
import {response} from "express";
import {UserService} from "../user.service";
import {user} from "@angular/fire/auth";

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [
    FormsModule,
    HttpClientModule,
    RouterModule,
    CommonModule // Asegúrate de importar CommonModule
  ],
})
export class RegisterComponent implements OnInit, AfterViewInit {
  @Input() isAdmin: boolean = false;
  @ViewChild('nameInput') nameInput!: ElementRef;
  @ViewChild('emailInput') emailInput!: ElementRef;
  @ViewChild('passwordInput') passwordInput!: ElementRef;
  @ViewChild('confirmPasswordInput') confirmPasswordInput!: ElementRef; // Nuevo

  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = ''; // Nuevo
  message: string = '';
  messageClass: string = '';
  currentStep: number = 1;
  direction: string = 'next';
  emailValid: boolean = false;
  passwordValid: boolean = false;
  confirmPasswordValid: boolean = false; // Nuevo
  emailTouched: boolean = false;
  passwordTouched: boolean = false;
  confirmPasswordTouched: boolean = false; // Nuevo
  passwordStrengthLevel: string = '';
  passwordStrengthText: string = '';
  private emailTypingTimeout: any;
  private passwordTypingTimeout: any;
  submitted: boolean = false;
  userExists: boolean = false;
  showPassword: boolean = false;

  constructor(private authService: AuthService, private userService: UserService) { }

  ngOnInit(): void {
    // Inicialización si es necesario
  }

  ngAfterViewInit(): void {
    this.animateText("¡Bienvenido a Astralis!", 100);
    this.nameInput.nativeElement.focus();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }


  // Animación de texto
  animateText(text: string, speed: number) {
    const animatedTextElement = document.getElementById('animated-text');
    if (!animatedTextElement) return;

    animatedTextElement.innerHTML = '';
    let index = 0;

    animatedTextElement.style.visibility = 'visible';

    const interval = setInterval(() => {
      if (index < text.length) {
        animatedTextElement.innerHTML += text.charAt(index);
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);
  }

  // Envío del formulario
  onSubmit() {
    this.submitted = true;

    // Validar la contraseña
    if (!this.isPasswordValid()) {
      this.message = 'La contraseña debe tener al menos 6 caracteres';
      this.messageClass = 'error-message';
      this.submitted = false;
      return;
    }

    // Validar que las contraseñas coincidan
    if (this.password !== this.confirmPassword) {
      this.message = 'Las contraseñas no coinciden';
      this.messageClass = 'error-message';
      this.submitted = false;
      return;
    }
    this.message = 'Registrando usuario, por favor espera...';
    this.messageClass = 'info-message';

    // Intentar registrar
    this.authService.register(this.email, this.password, this.name).subscribe({
      next: (response: HttpResponse<any>) => {
        setTimeout(() => {
          if (response.status === 200) {
            this.message = response.body || '¡Registro exitoso! Por favor, revisa tu correo electrónico para activar tu cuenta.';
            this.messageClass = 'success-message';
          } else {
            this.message = 'Registro fallido. Por favor, intenta de nuevo.';
            this.messageClass = 'error-message';
          }
          this.submitted = false; // Restaurar estado
        }, 2000); // Retraso de 2 segundos
      },
      error: (error) => {
        setTimeout(() => {
          console.error('Error:', error);
          this.message = 'Registro fallido. Por favor, intenta de nuevo.';
          this.messageClass = 'error-message';
          this.submitted = false; // Restaurar estado
        }, 2000); // Retraso de 2 segundos
      },
    });
  }
  // Manejo de pasos del formulario
  nextStep() {
    if (this.currentStep === 1) {
      if (!this.name || this.name.trim().length === 0) {
        this.message = "Por favor, ingresa tu nombre";
        this.messageClass = "error-message";
        return;
      }
      this.currentStep++;
      setTimeout(() => this.emailInput.nativeElement.focus(), 100);
    }
    else if (this.currentStep === 2) {
      this.emailTouched = true;
      if (this.email.length === 0 || !this.isEmailValid()) {
        this.message = "Por favor, ingresa un correo electrónico válido";
        this.messageClass = "error-message";
        return;
      }
      this.currentStep++;
      setTimeout(() => this.passwordInput.nativeElement.focus(), 100);
    }
    else if (this.currentStep === 3) {
      this.passwordTouched = true;
      if (!this.isPasswordValid()) {
        this.message = "La contraseña debe tener al menos 6 caracteres";
        this.messageClass = "error-message";
        return;
      }
      this.currentStep++;
      setTimeout(() => this.confirmPasswordInput.nativeElement.focus(), 100);
    }
    else if (this.currentStep === 4) {
      this.confirmPasswordTouched = true;
      if (this.password !== this.confirmPassword) {
        this.message = "Las contraseñas no coinciden";
        this.messageClass = "error-message";
        return;
      }
      this.message = "Formulario completo y válido!";
      this.messageClass = "success-message";
    }
  }

  // Paso anterior
  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.message = '';
      this.messageClass = '';
    }
  }

  onEmailKeyUp() {
    clearTimeout(this.emailTypingTimeout);
    this.emailTypingTimeout = setTimeout(() => {
      if (this.email.length > 0) {
        this.emailTouched = true;
        this.emailValid = this.isEmailValid();
        if (this.emailValid) {
          this.checkUserExists(); // Verificar si el usuario existe
        }
      } else {
        this.emailTouched = false;
        this.emailValid = false;
        this.message = '';
        this.messageClass = '';
        this.userExists = false; // Resetear si el email está vacío
      }
    }, 700);
  }

  onPasswordKeyUp() {
    clearTimeout(this.passwordTypingTimeout);

    this.passwordTypingTimeout = setTimeout(() => {
      if (this.password.length > 0) {
        this.passwordTouched = true;
        this.passwordValid = this.isPasswordValid();
        this.calculatePasswordStrength();
      } else {
        this.passwordTouched = false;
        this.passwordValid = false;
        this.passwordStrengthLevel = '';
        this.passwordStrengthText = '';
      }
    }, 2000);
  }

  // Validaciones de confirmación de contraseña
  onConfirmPasswordKeyUp() {
    clearTimeout(this.passwordTypingTimeout);
    this.passwordTypingTimeout = setTimeout(() => {
      if (this.confirmPassword.length > 0) {
        this.confirmPasswordTouched = true;
        this.confirmPasswordValid = this.password === this.confirmPassword;
        if (!this.confirmPasswordValid) {
          this.message = 'Las contraseñas no coinciden';
          this.messageClass = 'error-message';
        } else {
          this.message = '';
          this.messageClass = '';
        }
      } else {
        this.confirmPasswordTouched = false;
        this.confirmPasswordValid = false;
        this.message = '';
        this.messageClass = '';
      }
    }, 700);
  }

  // Eventos de blur
  onPasswordBlur() {
    this.passwordTouched = true;
  }

  onConfirmPasswordBlur() {
    this.confirmPasswordTouched = true;
    this.checkPasswordsMatch();
  }

  // Cálculo de la fortaleza de la contraseña
  calculatePasswordStrength() {
    const password = this.password;
    let strength = 0;

    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 1) {
      this.passwordStrengthLevel = 'low-strength';
      this.passwordStrengthText = 'Débil';
    } else if (strength === 2 || strength === 3) {
      this.passwordStrengthLevel = 'medium-strength';
      this.passwordStrengthText = 'Media';
    } else {
      this.passwordStrengthLevel = 'high-strength';
      this.passwordStrengthText = 'Fuerte';
    }
  }

  // Validaciones auxiliares
  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailValid = emailRegex.test(this.email);
    return this.emailValid;
  }

  isPasswordValid(): boolean {
    this.passwordValid = this.password.length >= 6;
    return this.passwordValid;
  }

  checkPasswordsMatch() {
    this.confirmPasswordValid = this.password === this.confirmPassword;
    if (!this.confirmPasswordValid && this.confirmPasswordTouched) {
      this.message = 'Las contraseñas no coinciden';
      this.messageClass = 'error-message';
    } else {
      this.message = '';
      this.messageClass = '';
    }
  }

  checkUserExists() {
    this.userService.checkUserExists(this.email).subscribe({
      next: (response) => {
        if (response.exists) {
          this.message = 'El correo electrónico ya está registrado.';
          this.messageClass = 'error-message';
          this.emailValid = false;
          this.userExists = true;
        } else {
          this.message = '';
          this.messageClass = '';
          this.userExists = false;
        }
      },
      error: (error) => {
        console.error('Error al verificar el usuario:', error);
        // Manejar el error según sea necesario
      }
    });
  }


  // Reseteo del formulario
  private resetForm() {
    this.name = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.message = '';
    this.messageClass = '';
    this.currentStep = 1;
    this.emailValid = false;
    this.passwordValid = false;
    this.confirmPasswordValid = false;
    this.emailTouched = false;
    this.passwordTouched = false;
    this.confirmPasswordTouched = false;
    this.passwordStrengthLevel = '';
    this.passwordStrengthText = '';
    this.submitted = false;
    this.userExists = false; //
  }

  onEmailBlur() {
    this.emailTouched = true;
  }

  protected readonly user = user;
}
