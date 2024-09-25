import {Component, OnInit, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { AuthService } from '../auth.service';
import {BackgroundAnimationService} from "../background-animation.service";
import {After} from "node:v8";
import {response} from "express";

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
  @ViewChild('nameInput') nameInput!: ElementRef;
  @ViewChild('emailInput') emailInput!: ElementRef;
  @ViewChild('passwordInput') passwordInput!: ElementRef;

  name: string = '';
  email: string = '';
  password: string = '';
  message: string = '';
  messageClass: string = '';
  currentStep: number = 1;
  direction: string = 'next';
  emailValid: boolean = false;
  passwordValid: boolean = false;
  emailTouched: boolean = false;
  passwordTouched: boolean = false;
  passwordStrengthLevel: string = '';
  passwordStrengthText: string = '';
  private emailTypingTimeout: any;
  private passwordTypingTimeout: any;
  submitted: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // this.animation.initializeGraphAnimation()
  }

  onSubmit() {
    this.submitted = true; // Marcar que se ha intentado enviar el formulario

    // Si la contraseña no es válida, no continuar
    // if (!this.isPasswordValid()) {
    //   this.message = 'Password must be at least 6 characters';
    //   this.messageClass = 'error-message';
    //   return;
    // }

    // Intentar registrar solo si todo es válido
    this.authService.register(this.email, this.password, this.name).subscribe(
      response => {
        if (response.status === 200) {
          this.message = 'Registration successful! \n Please check your email to activate your account.';
          this.messageClass = 'success-message';
        } else {
          this.message = 'Registration failed. Please try again.';
          this.messageClass = 'error-message';
        }
      },
      error => {
        this.message = 'Registration failed. Please try again.';
        this.messageClass = 'error-message';
      }
    );
  }

  ngAfterViewInit(): void {
    this.animateText("Welcome to Astralis!", 100);
    this.nameInput.nativeElement.focus();
  }

  animateText(text: string, speed: number) {
    const animatedTextElement = document.getElementById('animated-text');
    if (!animatedTextElement) return;

    animatedTextElement.innerHTML = ''; // Asegurarse de que está vacío antes de comenzar
    let index = 0;

    animatedTextElement.style.visibility = 'visible'; // Mostrar el elemento cuando la animación comience

    const interval = setInterval(() => {
      if (index < text.length) {
        animatedTextElement.innerHTML += text.charAt(index);
        index++;
      } else {
        clearInterval(interval); // Detener el intervalo cuando termine la animación
      }
    }, speed); // Controla la velocidad de la animación
  }

  nextStep() {
    // Validar el campo de nombre en el primer paso
    if (this.currentStep === 1) {
      if (!this.name || this.name.trim().length === 0) {
        this.message = "Please enter your name";
        this.messageClass = "error-message";
        return;
      }
      this.currentStep++; // Avanzar al siguiente paso
      setTimeout(() => this.emailInput.nativeElement.focus(), 100); // Foco en el email después del nombre
    }

    // Validar el campo de email en el segundo paso
    else if (this.currentStep === 2) {
      this.emailTouched = true;
      if (this.email.length === 0 || !this.isEmailValid()) {
        this.message = "Please enter a valid email";
        this.messageClass = "error-message";
        return;
      }
      this.currentStep++; // Avanzar al siguiente paso
      setTimeout(() => this.passwordInput.nativeElement.focus(), 100); // Foco en el password después del email
    }

    // Validar el campo de contraseña en el tercer paso
    else if (this.currentStep === 3) {
      if (!this.passwordTouched) {
        // Si el campo de contraseña no ha sido tocado aún, simplemente avanzar sin mensaje
        this.message = '';
      } else if (!this.isPasswordValid() || this.password.length > 0) {
        this.message = "Password must be at least 6 characters";
        this.messageClass = "error-message";
        return;
      }
      this.message = "Form complete and valid!";
      this.messageClass = "success-message";
    }

  }

  onPasswordBlur() {
    this.passwordTouched = true; // Marcar el campo como "tocado" si el usuario deja el campo
  }



  onEmailKeyUp() {
    clearTimeout(this.emailTypingTimeout);
    this.emailTypingTimeout = setTimeout(() => {
      if (this.email.length > 0) {
        this.emailTouched = true;
        this.emailValid = this.isEmailValid();
      } else {
        this.emailTouched = false;
        this.emailValid = false;
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
        // Si el usuario borra todo, no mostrar ningún mensaje ni iconos
        this.passwordTouched = false;
        this.passwordValid = false;
        this.passwordStrengthLevel = '';
        this.passwordStrengthText = '';
      }
    }, 2000);
  }

  onEmailKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.emailTouched = true;
      this.isEmailValid();
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      // Obtener el elemento actual y aplicar la clase "next-hidden"
      const currentElement = document.querySelector('.form-group.visible');
      if (currentElement) {
        currentElement.classList.add('next-hidden');
      }

      setTimeout(() => {
        this.direction = 'prev';
        this.currentStep--;

        // Hacer visible el input anterior
        const prevElement = document.querySelector('.form-group.visible');
        if (prevElement) {
          prevElement.classList.remove('next-hidden');
        }
      }, 500); // Tiempo de la animación
    }
  }

  calculatePasswordStrength() {
    const password = this.password;
    let strength = 0;

    // Calcular el nivel de seguridad basado en las siguientes reglas
    if (password.length >= 6) {
      strength++;
    }
    if (/[A-Z]/.test(password)) {
      strength++;
    }
    if (/[0-9]/.test(password)) {
      strength++;
    }
    if (/[^A-Za-z0-9]/.test(password)) {
      strength++;
    }

    // Actualizar el nivel de seguridad y el texto según la fuerza
    if (strength <= 1) {
      this.passwordStrengthLevel = 'low-strength';
      this.passwordStrengthText = 'Weak';
    } else if (strength === 2) {
      this.passwordStrengthLevel = 'medium-strength';
      this.passwordStrengthText = 'Medium';
    } else {
      this.passwordStrengthLevel = 'high-strength';
      this.passwordStrengthText = 'Strong';
    }
  }

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailValid = emailRegex.test(this.email);
    return this.emailValid;
  }

  isPasswordValid(): boolean {
    this.passwordValid = this.password.length >= 6;
    return this.passwordValid;
  }

  checkNameAndNextStep() {
    if (this.name.length > 0) {
      this.nextStep();
    } else {
      this.message = "Please enter your name";
      this.messageClass = "error-message";
    }
  }

  // Método para verificar el email al presionar "Enter"
  checkEmailAndNextStep() {
    if (this.isEmailValid()) {
      this.nextStep();
    } else {
      this.message = "Please enter a valid email";
      this.messageClass = "error-message";
    }
  }

  // Método para verificar la contraseña al presionar "Enter"
  // checkPasswordAndNextStep() {
  //   if (this.isPasswordValid()) {
  //     this.nextStep();
  //   } else {
  //     this.message = "Password must be at least 6 characters";
  //     this.messageClass = "error-message";
  //   }
  // }


  protected readonly SubmitEvent = SubmitEvent;
}
