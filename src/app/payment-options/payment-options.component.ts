import {Component, EventEmitter, Output, OnInit, Input} from '@angular/core';
import {NgIf} from "@angular/common";
import { PaymentMethod } from '../models/payment-method.interface';
import { OrderDetails } from '../models/order-details.model';
import { AuthService } from "../auth.service";

@Component({
  selector: 'app-payment-options',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './payment-options.component.html',
  styleUrl: './payment-options.component.css'
})
export class PaymentOptionsComponent implements OnInit {
  @Input() BuyingBalance: boolean = false;

  @Output() closeModal = new EventEmitter<void>();
  @Output() paymentSelected = new EventEmitter<string>();
  isLoggedIn : boolean = false;


  constructor(private authService: AuthService){

  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  close() {
    this.closeModal.emit();
  }

  selectPaymentMethod(method: string) {
    this.paymentSelected.emit(method);
    this.close();
  }
}
