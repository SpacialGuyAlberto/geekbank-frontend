import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from "../../../../services/auth.service";
import {Auth} from "@angular/fire/auth";
@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {

  changePasswordForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validator: this.passwordsMatchValidator // Custom validator
    });
  }

  passwordsMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  changePassword() {
    if (this.changePasswordForm.valid) {
      this.authService.resetPassword(
        this.changePasswordForm.get('currentPassword'),
        this.changePasswordForm.get('newPassword')
      ).subscribe(
        response => {
          console.log('Password updated successfully', response);
        },
        error => {
          console.error('Error updating password', error);
        }
      );
    } else {
      console.error('Form is invalid');
    }
  }

}
