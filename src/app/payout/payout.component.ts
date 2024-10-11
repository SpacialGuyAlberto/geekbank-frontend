// src/app/components/payout/payout.component.ts
import { Component } from '@angular/core';
import { PayoutService } from '../services/payout.service';
import {FormsModule} from "@angular/forms";
import {CreatePayoutRequest, CreatePayoutResponse} from "../models/payment.models";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-payout',
  templateUrl: './payout.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgIf
  ],
  styleUrls: ['./payout.component.css']
})
export class PayoutComponent {

  payoutRequest: CreatePayoutRequest = {
    email: '',
    amount: '',
    currency: 'USD',
    note: '',
    recipientName: ''
  };

  response: CreatePayoutResponse | null = null;
  error: string | null = null;

  constructor(private payoutService: PayoutService) { }

  submitPayout() {
    this.response = null;
    this.error = null;

    this.payoutService.createPayout(this.payoutRequest)
      .subscribe({
        next: (res) => {
          this.response = res;
          alert('Payout creado exitosamente.');
        },
        error: (err) => {
          this.error = err;
          alert('Ocurrió un error al crear el payout.');
        }
      });
  }
}
