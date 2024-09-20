import { Component, OnInit, AfterViewInit } from '@angular/core';
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
  name: string = '';
  email: string = '';
  password: string = '';
  message: string = '';
  messageClass: string = '';
  currentStep: number = 1; // Inicialmente solo se mostrará el primer input
  direction: string = 'next';
  emailValid: boolean = false;
  passwordValid: boolean = false;
  emailTouched: boolean = false; // Control para saber si el campo ha sido revisado
  passwordTouched: boolean = false; // Control para saber si el campo ha sido revisado
  constructor(private authService: AuthService, private animation: BackgroundAnimationService) { }

  ngOnInit(): void {
    this.animation.initializeGraphAnimation()
  }

  onSubmit() {
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
    if (this.currentStep === 1 && !this.name) {
      this.message = "Please enter your name";
      this.messageClass = "error-message";
      return;
    }

    if (this.currentStep === 2) {
      this.emailTouched = true;
      if (!this.isEmailValid()) {
        this.message = "Please enter a valid email";
        this.messageClass = "error-message";
        return;
      }
    }

    if (this.currentStep === 3) {
      this.passwordTouched = true;
      if (!this.isPasswordValid()) {
        this.message = "Password must be at least 6 characters";
        this.messageClass = "error-message";
        return;
      }
    }

    this.message = "";
    this.currentStep++; // Avanzamos al siguiente campo
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

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailValid = emailRegex.test(this.email);
    return this.emailValid;
  }

  isPasswordValid(): boolean {
    this.passwordValid = this.password.length >= 6;
    return this.passwordValid;
  }

}
