import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import {NgClass, NgIf} from "@angular/common";
import {HttpResponse} from "@angular/common/http";

@Component({
  selector: 'app-create-customer',
  templateUrl: './create-customer.component.html',
  styleUrls: ['./create-customer.component.css'],
  standalone: true,
  imports: [FormsModule, NgClass, NgIf],
})
export class CreateCustomerComponent implements OnInit, AfterViewInit {
  @ViewChild('nameInput') nameInput!: ElementRef;
  @ViewChild('emailInput') emailInput!: ElementRef;

  name: string = '';
  email: string = '';
  message: string = '';
  messageClass: string = '';
  emailValid: boolean = false;
  emailTouched: boolean = false;
  private emailTypingTimeout: any;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.nameInput.nativeElement.focus();
  }

  onSubmit() {
    if (!this.isEmailValid()) {
      this.message = 'Por favor, ingresa un email válido.';
      this.messageClass = 'error-message';
      return;
    }

    this.authService.registerClientAsAdmin(this.email, this.name).subscribe({
      next: (response: HttpResponse<any>) => {

        if (response.status === 200) {
          this.message = 'Cliente registrado exitosamente.';
          this.messageClass = 'success-message';
          this.resetForm();
        } else {
          this.message = 'Error al registrar el cliente. Por favor, intenta nuevamente.';
          this.messageClass = 'error-message';
        }
      },
      error: error => {
        console.error('Error:', error);
        this.message = 'Error al registrar el cliente. Por favor, intenta nuevamente.';
        this.messageClass = 'error-message';
      }
    });
  }


  resetForm() {
    this.name = '';
    this.email = '';
    this.emailTouched = false;
    this.emailValid = false;
    setTimeout(() => this.nameInput.nativeElement.focus(), 100);
  }

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailValid = emailRegex.test(this.email);
    return this.emailValid;
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
}
