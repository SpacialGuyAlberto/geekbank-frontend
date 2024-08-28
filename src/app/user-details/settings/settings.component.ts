import { Component } from '@angular/core';
import {ClientsComponent} from "../../admin-panel/clients/clients.component";
import {HighlightsConfigComponent} from "../../admin-panel/highlights-config/highlights-config.component";
import {NgIf} from "@angular/common";
import {ProductsComponent} from "../../admin-panel/products/products.component";
import {StatisticsComponent} from "../../admin-panel/statistics/statistics.component";
import {TransactionsComponent} from "../../admin-panel/transactions/transactions.component";
import {BackgroundAnimationService} from "../../background-animation.service"
import {AccountInfoComponent} from "./account-info/account-info.component";
import {OrdersComponent} from "./orders/orders.component";
import {PaymentMethodsComponent} from "./payment-methods/payment-methods.component";
import {user} from "@angular/fire/auth";

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    ClientsComponent,
    HighlightsConfigComponent,
    NgIf,
    ProductsComponent,
    StatisticsComponent,
    TransactionsComponent,
    AccountInfoComponent,
    OrdersComponent,
    PaymentMethodsComponent,

  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  selectedSection: string = 'clients';

  constructor(private animation: BackgroundAnimationService) {
  }

  ngOnInit() {
    this.animation.initializeGraphAnimation();
    this.selectSection('products');
  }

  selectSection(section: string) {
    this.selectedSection = section;
  }


  protected readonly user = user;
}
