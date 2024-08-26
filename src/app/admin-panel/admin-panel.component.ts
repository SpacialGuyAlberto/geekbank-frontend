import { Component } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { CurrencyPipe, DatePipe, NgIf } from "@angular/common";
import { ClientsComponent } from './clients/clients.component';
import { ProductsComponent } from './products/products.component';
import {HighlightsConfigComponent} from "./highlights-config/highlights-config.component";
import { TransactionsComponent } from './transactions/transactions.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { BackgroundAnimationService } from "../background-animation.service";

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    CurrencyPipe,
    ClientsComponent,
    ProductsComponent,
    HighlightsConfigComponent,
    TransactionsComponent,
    StatisticsComponent,
    NgIf,
  ],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent {
  selectedSection: string = 'clients';
  constructor(private animation: BackgroundAnimationService) {}

  ngOnInit() {
    this.animation.initializeGraphAnimation();
    this.selectSection('products');
  }

  selectSection(section: string) {
    this.selectedSection = section;
  }
}
