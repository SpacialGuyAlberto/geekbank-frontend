import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf, NgOptimizedImage, UpperCasePipe} from "@angular/common";

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    CurrencyPipe,
    NgOptimizedImage,
    NgForOf,
    NgIf,
    NgClass,
    UpperCasePipe
  ],
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent {
  searchQuery: string = '';
  selectedClient: any = null;

  clients = [
    {
      id: 1,
      name: 'Jack',
      lastActivity: 54,
      photo: 'https://via.placeholder.com/80',
      transactions: [
          { id: 1, date: new Date(), amount: 150.50, status: 'COMPLETED', description: 'Compra de productos' },
        { id: 2, date: new Date(), amount: 120.00, status: 'PENDING', description: 'Pago de servicio' }
      ]
    },
    {
      id: 2,
      name: 'Amir',
      lastActivity: 180,
      photo: 'https://via.placeholder.com/80',
      transactions: [
        { id: 3, date: new Date(), amount: 90.00, status: 'PENDING', description: 'Compra de alimentos' },
        { id: 4, date: new Date(), amount: 40.00, status: 'REFUNDED', description: 'Reembolso por devolución' }
      ]
    },
    {
      id: 3,
      name: 'Ember',
      lastActivity: 360,
      photo: 'https://via.placeholder.com/80',
      transactions: [
        { id: 5, date: new Date(), amount: 200.00, status: 'REFUNDED', description: 'Reembolso de productos defectuosos' },
        { id: 6, date: new Date(), amount: 75.00, status: 'REFUNDED', description: 'Compra de servicios' }
      ]
    }
  ];

  get filteredClients() {
    return this.clients.filter(client => client.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
  }

  showTransactions(client: any) {
    this.selectedClient = client;
  }

  addClient() {
    // Lógica para agregar un nuevo cliente
    console.log('Agregar nuevo cliente');
  }
}
