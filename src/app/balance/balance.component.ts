// src/app/components/balance/balance.component.ts
import { Component, OnInit } from '@angular/core';
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import { FormsModule } from "@angular/forms";
import {AuthService} from "../auth.service";
import {TigoPaymentComponent} from "../tigo-payment/tigo-payment.component";
import {PaymentComponent} from "../payment/payment.component";

@Component({
  selector: 'app-balance',
  standalone: true,
  imports: [
    DatePipe,
    NgForOf,
    NgIf,
    NgClass,
    FormsModule,
    CurrencyPipe,
    TigoPaymentComponent,
    PaymentComponent
  ],
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css']
})
export class BalanceComponent implements OnInit {
  isDropdownVisible = false;
  balanceIcon: string = 'balance-icon';
  balance: number = 0;
  balanceToBuy: number = 5;
  buyingBalance: boolean = true;
  protected showPaymentModal: boolean = false;


  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getUserDetails().subscribe(data => {
      this.balance = data.account.balance;
    });
  }

  showDropdown() {
    this.isDropdownVisible = true;
  }

  hideDropdown() {
    setTimeout(() => {
      this.isDropdownVisible = false;
    }, 2000);
  }
  incrementBalance() {
    this.balanceToBuy += 1;
  }

  decrementBalance() {
    if (this.balanceToBuy > 0) {
      this.balanceToBuy -= 1;
    }
  }



  comprar() {
    console.log('Método comprar() llamado');
    this.showPaymentModal = true;
  }

  regalarBalance() {
    console.log('Botón Regalar Balance clicado');

  }

  onModalClose() {
    this.showPaymentModal = false;
  }
}
