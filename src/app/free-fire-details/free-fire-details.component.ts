import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FreeFireProductService } from "../free-fire-product.service";
import { FreeFireDiamondProduct } from "../models/free-fire-diamond-product.interface";
import { PaymentOptionsComponent } from "../payment-options/payment-options.component";
import { TigoPaymentComponent } from "../tigo-payment/tigo-payment.component";
import {CartService} from "../cart.service";


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
  gamerUserId: number | null = null; // Type changed to number
  gamerUserIdError: boolean = false; // Track if gamerUserId is invalid

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
      return; // Stop execution if no product is selected
    }

    // Validate gamerUserId: check if it's a valid number and has 7 digits
    this.gamerUserIdError = !(this.gamerUserId !== null && /^\d{7}$/.test(this.gamerUserId.toString()));

    if (this.gamerUserIdError) {
      return; // Stop execution if gamerUserId is invalid
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
