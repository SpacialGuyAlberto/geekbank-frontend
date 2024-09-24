import {Component, OnInit, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import {CommonModule, NgClass} from '@angular/common'; // Importa CommonModule
import { AuthService } from '../auth.service';
import { BackgroundAnimationService } from "../background-animation.service";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {response} from "express";

declare const google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgClass
  ],
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('emailInput') emailInput!: ElementRef;
  @ViewChild('passwordInput') passwordInput!: ElementRef;

  email: string = '';
  password: string = '';
  message: string = '';
  messageClass: string = '';
  emailValid: boolean = false;
  passwordValid: boolean = false;
  emailTouched: boolean = false;
  passwordTouched: boolean = false;
  submitted: boolean = false;
  private emailTypingTimeout: any;
  private passwordTypingTimeout: any;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // this.animation.initializeGraphAnimation()

    if (this.authService.isBrowser()) {
      this.authService.loadGoogleScript().then(() => {
        this.authService.initializeGoogleSignIn();
      }).catch(error => {
        console.error('Error loading Google script', error);
      });
    }
  }

  ngAfterViewInit(): void {
    this.animateText("Welcome back to Astralis!", 100);
    this.emailInput.nativeElement.focus();
  }

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

  onSubmit() {
    this.authService.login(this.email, this.password).subscribe(
      response => {
        if (response.status === 200) {
          const authResult = response.body;
          this.authService.setSession(authResult);
          this.router.navigate(['/home']).then((success: boolean) => {
            if (success) {
              console.log('Navigation to home was successful!');
            } else {
              console.log('Navigation to home failed.');
            }
          });

        } else {
          this.message = 'Login failed. Please try again.';
          this.messageClass = 'error-message';
        }
      },
      error => {
        this.message = 'Login failed. Please try again.';
        this.messageClass = 'error-message';
      }
    );
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
      } else {
        this.passwordTouched = false;
        this.passwordValid = false;
      }
    }, 700);
  }

  onEmailKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.emailTouched = true;
      this.isEmailValid();
      setTimeout(() => this.passwordInput.nativeElement.focus(), 100);
    }
  }

  onPasswordKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSubmit(); // Ejecutar el login si presionan Enter en el campo de contraseña
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
