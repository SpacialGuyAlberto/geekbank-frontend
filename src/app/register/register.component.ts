import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { AuthService } from '../auth.service';

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
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  message: string = '';
  messageClass: string = '';

  constructor(private authService: AuthService) { }

  onSubmit() {
    this.authService.register(this.email, this.password, this.name).subscribe(
      response => {
        if (response.status === 200) {
          this.message = 'Registration successful!';
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
