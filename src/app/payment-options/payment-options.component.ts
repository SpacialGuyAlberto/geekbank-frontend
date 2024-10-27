import {Component, EventEmitter, Output} from '@angular/core';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-payment-options',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './payment-options.component.html',
  styleUrl: './payment-options.component.css'
})
export class PaymentOptionsComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() paymentSelected = new EventEmitter<string>();

  // Método para cerrar el modal
  close() {
    this.closeModal.emit();
  }

  // Método para seleccionar una opción de pago
  selectPaymentMethod(method: string) {
    this.paymentSelected.emit(method);
    this.close();
  }
}
