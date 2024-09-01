import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="modal-backdrop" (click)="closeModal()"></div>
    <div class="modal-content">
      <h3>Enter your password to confirm</h3>
      <form (ngSubmit)="validatePassword()">
        <label for="password">Password:</label>
        <input type="password" id="password" [(ngModel)]="password" name="password" required>
        <div *ngIf="errorMessage">
          <small class="error">{{ errorMessage }}</small>
        </div>
        <button type="submit">Confirm</button>
        <button type="button" (click)="closeModal()">Cancel</button>
      </form>
    </div>
  `,
  styleUrl: './password-modal.component.css'
})
export class PasswordModalComponent {
  password: string = '';
  errorMessage: string = '';
  @Output() onConfirm = new EventEmitter<boolean>();

  validatePassword() {
    // Replace with real password validation logic
    if (this.password === 'Punkhazard4!') {
      this.onConfirm.emit(true);
      this.closeModal();
    } else {
      this.errorMessage = 'Incorrect password. Please try again.';
    }
  }

  closeModal() {
    this.onConfirm.emit(false);
  }
}

