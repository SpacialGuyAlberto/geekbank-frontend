// src/app/components/balance/balance.component.ts
import { Component, OnInit } from '@angular/core';
import {AsyncPipe, CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import { FormsModule } from "@angular/forms";
import {AuthService} from "../auth.service";
import {TigoPaymentComponent} from "../tigo-payment/tigo-payment.component";
import {PaymentComponent} from "../payment/payment.component";
import {selectUser, selectIsAuthenticated} from "../state/auth/auth.selectors";
import { AppState } from "../app.state";
import {Observable, of} from "rxjs";
import {User} from "../models/User";
import {Store} from "@ngrx/store";
import {loadUserFromSession} from "../state/auth/auth.actions";
import {map} from "rxjs/operators";

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
    PaymentComponent,
    AsyncPipe
  ],
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css']
})
export class BalanceComponent implements OnInit {
  isDropdownVisible = false;
  balanceIcon: string = 'balance-icon';
  balance: number | undefined = 0;
  balanceToBuy: number = 5;
  buyingBalance: boolean = true;
  protected showPaymentModal: boolean = false;

  user$: Observable<User | null> = of(null);
  isAuthenticated$: Observable<boolean> = of(false);
  balance$: Observable<number> = of(0);

  constructor(
    private authService: AuthService,
    private store: Store<AppState>
    ) {
    this.user$ = this.store.select(selectUser);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.balance$ = this.user$.pipe(
      map((user) => user?.account?.balance || 0)
    );
  }

  ngOnInit(): void {
    // this.authService.getUserDetails().subscribe(data => {
    //   this.balance = data.account.balance;
    // });
    this.store.dispatch(loadUserFromSession());
    // this.user$.subscribe(data => this.balance = data?.account.balance)
    this.balance$.subscribe((balance) => {
      console.log('Balance in Account:', balance);
    });
    console.log("BALANCE IN ACCOUNT" + this.balance)

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
