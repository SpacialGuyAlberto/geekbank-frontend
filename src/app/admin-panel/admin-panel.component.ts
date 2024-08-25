import { Component } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { CurrencyPipe, DatePipe } from "@angular/common";
import { ClientsComponent } from './clients/clients.component'
import { ProductsComponent } from './products/products.component';
import { HightlightsComponent} from './hightlights/hightlights.component'
import { TransactionsComponent } from './transactions/transactions.component';
import { StatisticsComponent } from './statistics/statistics.component';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    CurrencyPipe,
    ClientsComponent,
    ProductsComponent,
    HightlightsComponent,
    TransactionsComponent,
    StatisticsComponent
  ],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent {
  selectedSection: string = 'clients'; // Valor inicial

  startDate: any;
  endDate: any;
  transactions: any;

  filterTransactions() {
    // Implementa la lógica para filtrar transacciones
  }

  exportTransactions() {
    // Implementa la lógica para exportar transacciones
  }

  selectSection(section: string) {
    this.selectedSection = section;
  }
}
