// src/app/components/balance/balance.component.ts
import { Component, OnInit } from '@angular/core';
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import { FormsModule } from "@angular/forms";
import {AuthService} from "../auth.service";

@Component({
  selector: 'app-balance',
  standalone: true,
  imports: [
    DatePipe,
    NgForOf,
    NgIf,
    NgClass,
    FormsModule,
    CurrencyPipe
  ],
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css']
})
export class BalanceComponent implements OnInit {
  isDropdownVisible = false;
  balanceIcon: string = 'balance-icon';
  balance: number = 25; // Ejemplo de balance inicial

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

  comprar() {
    console.log('Botón Comprar clicado');
  }

  regalarBalance() {
    console.log('Botón Regalar Balance clicado');
    // Aquí puedes implementar la lógica para regalar balance
  }
}
