// src/app/components/payment/payment.component.ts

import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../services/payment.service';
import { Router } from '@angular/router';
import { CreatePaymentResponse, CapturePaymentResponse } from '../models/payment.models'
import { ToastrService } from 'ngx-toastr';
import {FormsModule} from "@angular/forms"; // Opcional: para notificaciones

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  standalone: true,
  imports: [
    FormsModule
  ],
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  total: string = '50.00';
  currency: string = 'USD';
  approvalUrl: string = '';

  constructor(
    private paymentService: PaymentService,
    private router: Router,
    private toastr: ToastrService // Opcional
  ) { }

  ngOnInit(): void {
    // Inicialización si es necesario
  }

  createPayment(): void {
    const returnUrl = 'http://localhost:4200/payment-success';
    const cancelUrl = 'http://localhost:4200/payment-cancel';

    this.paymentService.createPayment(this.total, this.currency, returnUrl, cancelUrl)
      .subscribe({
        next: (response: CreatePaymentResponse) => {
          this.approvalUrl = response.approvalUrl;
          // Redirigir al usuario a la URL de aprobación de PayPal
          window.location.href = this.approvalUrl;
        },
        error: (error) => {
          console.error('Error al crear el pago:', error);
          this.toastr.error('Ocurrió un error al crear el pago.', 'Error'); // Opcional
        }
      });
  }
}
