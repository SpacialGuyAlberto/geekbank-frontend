import { Component } from '@angular/core';
import {CurrencyPipe, DatePipe, NgForOf} from "@angular/common";

@Component({
  selector: 'app-manual-sales',
  standalone: true,
  imports: [
    NgForOf,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './manual-sales.component.html',
  styleUrl: './manual-sales.component.css'
})
export class ManualSalesComponent {
  // Datos ficticios de ventas pendientes
  pendingSales = [
    { id: 1, platform: 'Amazon', product: 'Tarjeta de Regalo Amazon', amount: '$50', date: '30-09-2024' },
    { id: 2, platform: 'eBay', product: 'PlayStation 5', amount: '$499.99', date: '29-09-2024' },
    { id: 3, platform: 'Shopify', product: 'Audífonos Bluetooth', amount: '$120', date: '28-09-2024' },
    { id: 4, platform: 'Mercado Libre', product: 'iPhone 13', amount: '$999.99', date: '27-09-2024' },
    { id: 5, platform: 'Amazon', product: 'Libro - Clean Code', amount: '$29.99', date: '26-09-2024' }
  ];

  // Función para completar la venta
  completeSale(saleId: number) {
    this.pendingSales = this.pendingSales.filter(sale => sale.id !== saleId);
    // Aquí puedes agregar la lógica adicional para marcar la venta como completada en el backend
    console.log(`Venta con ID ${saleId} completada`);
  }
}
