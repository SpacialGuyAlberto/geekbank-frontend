import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { AuthService } from '../auth.service';
import {BackgroundAnimationService} from "../background-animation.service";

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
export class RegisterComponent implements OnInit {
  name: string = '';
  email: string = '';
  password: string = '';
  message: string = '';
  messageClass: string = '';

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
}
