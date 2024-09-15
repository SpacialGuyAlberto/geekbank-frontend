import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {CurrencyPipe, DatePipe, NgForOf} from "@angular/common";

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    CurrencyPipe,
    NgForOf
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css'
})
export class TransactionsComponent {
  startDate: any;
  endDate: any;
  transactions: any;

  filterTransactions() {

  }

  exportTransactions() {

  }
}
