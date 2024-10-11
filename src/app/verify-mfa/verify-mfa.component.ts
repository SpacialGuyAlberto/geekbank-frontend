// verify-mfa.component.ts
import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-mfa',
  templateUrl: './verify-mfa.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  styleUrls: ['./verify-mfa.component.css']
})
export class VerifyMfaComponent {
  verifyForm: FormGroup;
  message: string = '';
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.verifyForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      mfaCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
  }

  // onSubmit() {
  //   if (this.verifyForm.valid) {
  //     const { email, mfaCode } = this.verifyForm.value;
  //     this.userService.verifyMfa(email, mfaCode).subscribe({
  //       next: (response) => {
  //         this.message = 'Detalles del usuario actualizados correctamente.';
  //         this.error = '';
  //         // Redirigir al dashboard o página deseada
  //         this.router.navigate(['/dashboard']);
  //       },
  //       error: (err) => {
  //         this.error = err.error?.error || 'Error al verificar el código MFA.';
  //         this.message = '';
  //       }
  //     });
  //   }
  // }
}
