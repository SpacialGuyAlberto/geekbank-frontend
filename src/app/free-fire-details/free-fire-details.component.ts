import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FreeFireProductService } from "../free-fire-product.service";
import { FreeFireDiamondProduct } from "../models/free-fire-diamond-product.interface";
import { PaymentOptionsComponent } from "../payment-options/payment-options.component";
import { TigoPaymentComponent } from "../tigo-payment/tigo-payment.component";

@Component({
  selector: 'app-free-fire-details',
  standalone: true,
  imports: [FormsModule, CommonModule, PaymentOptionsComponent, TigoPaymentComponent],
  templateUrl: './free-fire-details.component.html',
  styleUrls: ['./free-fire-details.component.css']
})
export class FreeFireDetailsComponent {
  products: FreeFireDiamondProduct[] = [];
  selectedOption: FreeFireDiamondProduct | null = null; // Producto seleccionado
  userId: string = '';
  userEmail: string = '';
  isPaymentModalOpen: boolean = false;
  isTigoPaymentModalOpen: boolean = false;
  gamerUserId: number = 0;

  constructor(private freeFireProductService: FreeFireProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.freeFireProductService.getFreeFireProducts().subscribe(
      (data) => {
        this.products = data;
      },
      (error) => {
        console.error('Error al cargar productos:', error);
      }
    );
  }

  selectOption(product: FreeFireDiamondProduct) {
    this.selectedOption = product;
    console.log(this.selectedOption);
  }

  extractDiamonds(name: string): string {
    const match = name.match(/\d+/); // Encuentra el primer número en el nombre
    return match ? `${match[0]} Diamantes` : name; // Formatea como "XXX Diamantes"
  }

  openPaymentModal() {
    if (!this.selectedOption) {
      alert('Por favor, selecciona una opción de diamantes antes de comprar.');
      return;
    }
    this.isPaymentModalOpen = true;
  }


  closePaymentModal() {
    this.isPaymentModalOpen = false;
  }


  onPaymentSelected(method: string) {
    this.closePaymentModal();
    if (method === 'Tigo Money') {
      this.isTigoPaymentModalOpen = true;
    }
    console.log(`Método de pago seleccionado: ${method}`);
  }

  closeTigoPaymentModal() {
    this.isTigoPaymentModalOpen = false;
  }
}
