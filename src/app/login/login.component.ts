// src/app/login/login.component.ts
import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { AppState } from '../app.state';
import { login } from '../state/auth/auth.actions';
import { selectIsAuthenticated } from '../state/auth/auth.selectors';
import {FormsModule} from "@angular/forms";
import {AuthService} from "../services/auth.service";
import {error} from "@angular/compiler-cli/src/transformers/util";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [NgClass, NgIf, FormsModule],
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  // Variables de formulario
  email: string = '';
  password: string = '';

  // Variables para mensajes y validación
  message: string = '';
  messageClass: string = '';
  emailValid: boolean = false;
  passwordValid: boolean = false;
  emailTouched: boolean = false;
  passwordTouched: boolean = false;
  private emailTypingTimeout: any;
  private passwordTypingTimeout: any;

  // Observables para el estado de autenticación y errores
  isAuthenticated$: Observable<boolean | null>;
  // authError$: Observable<any>;

  // Suscripciones
  private subscriptions: Subscription = new Subscription();

  // ViewChild para inputs
  @ViewChild('emailInput') emailInput!: ElementRef;
  @ViewChild('passwordInput') passwordInput!: ElementRef;

  constructor(private router: Router,
              private store: Store<AppState>,
              private authService: AuthService
              ) {
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    // this.authError$ = this.store.select(selectAuthError);
  }

  ngOnInit(): void {
    // Suscribirse al estado de autenticación
    this.subscriptions.add(
      this.isAuthenticated$.subscribe((isAuthenticated) => {
        if (isAuthenticated) {
          this.router.navigate(['/home']);
        }
      })
    );

    this.authService.loadGoogleScript()
      .then(() => {
        this.authService.initializeGoogleSignIn();
      })
      .catch((error) => {
        console.error("Error cargando el script de google", error)
      })
  }

  ngAfterViewInit(): void {
    this.animateText('Welcome back to Astralis!', 100);
    this.emailInput.nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
    if (this.isFormValid()) {
      // Despachar la acción de login
      this.store.dispatch(login({ email: this.email, password: this.password }));
    } else {
      this.message = 'Please fill out the form correctly.';
      this.messageClass = 'error-message';
    }
  }

  isFormValid(): boolean {
    return this.isEmailValid() && this.isPasswordValid();
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
