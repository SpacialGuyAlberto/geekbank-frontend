import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from "../services/auth.service";
import {NgClass, NgIf} from "@angular/common";
import { UserService } from "../user-details/user.service";
import {HttpResponse} from "@angular/common/http";

@Component({
    selector: 'app-set-password',
    templateUrl: './set-password.component.html',
    styleUrls: ['./set-password.component.css'],
    imports: [FormsModule, NgClass, NgIf]
})
export class SetPasswordComponent implements OnInit {
  password: string = '';
  token: string = '';
  message: string = '';
  messageClass: string = '';
  passwordStrengthLevel: string = '';
  passwordStrengthText: string = '';

  private passwordTypingTimeout: any;

  constructor(private route: ActivatedRoute, private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  onSubmit() {
    if (!this.isPasswordValid()) {
      this.message = 'La contraseña debe tener al menos 6 caracteres.';
      this.messageClass = 'error-message';
      return;
    }

    this.userService.setPassword(this.token, this.password).subscribe({
      next: (response: HttpResponse<any>) => {

        if (response.status === 200) {
          this.message = 'Contraseña establecida exitosamente. Ahora puedes iniciar sesión.';
          this.messageClass = 'success-message';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.message = 'Error al establecer la contraseña. Por favor, intenta nuevamente.';
          this.messageClass = 'error-message';
        }
      },
      error: error => {
        console.error('Error:', error);
        if (error.status === 400) {
          this.message = 'Solicitud inválida. Por favor, verifica tus datos.';
        } else if (error.status === 500) {
          this.message = 'Error del servidor. Por favor, intenta más tarde.';
        } else {
          this.message = 'Error al establecer la contraseña. Por favor, intenta nuevamente.';
        }
        this.messageClass = 'error-message';
      }
    });
  }

  isPasswordValid(): boolean {
    return this.password.length >= 6;
  }

  onPasswordKeyUp() {
    clearTimeout(this.passwordTypingTimeout);

    this.passwordTypingTimeout = setTimeout(() => {
      if (this.password.length > 0) {
        this.calculatePasswordStrength();
      } else {
        this.passwordStrengthLevel = '';
        this.passwordStrengthText = '';
      }
    }, 500);
  }

  calculatePasswordStrength() {
    const password = this.password;
    let strength = 0;

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

    if (strength <= 1) {
      this.passwordStrengthLevel = 'low-strength';
      this.passwordStrengthText = 'Débil';
    } else if (strength === 2) {
      this.passwordStrengthLevel = 'medium-strength';
      this.passwordStrengthText = 'Media';
    } else {
      this.passwordStrengthLevel = 'high-strength';
      this.passwordStrengthText = 'Fuerte';
    }
  }
}
