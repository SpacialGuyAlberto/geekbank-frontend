import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { startWith, map } from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';

interface Promotion {
  id: number;
  title: string;
  product: string;
  offerType: string;
  discountAmount?: number;
  promotionDetails?: string;
  content: string;
  regions: string[];
  platforms: string[];
  investment: number;
  employee: string;
  publishDate: Date;
}


interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  // Agrega otros campos relevantes
}
@Component({
  selector: 'app-promotion-sender',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatAutocompleteModule,
    MatInputModule,
    // ... otros módulos
  ],
  templateUrl: './promotion-sender.component.html',
  styleUrls: ['./promotion-sender.component.css']
})
export class PromotionSenderComponent implements OnInit {
  // Datos del formulario
  promotion: Promotion = {
    id: 0,
    title: '',
    product: '',
    offerType: '',
    content: '',
    regions: [],
    platforms: [],
    investment: 0,
    employee: '',
    publishDate: new Date()
  };

  // Listas para selección
  offerTypes = ['Descuento', 'Promoción', 'Oferta Especial'];
  regions = ['Norteamérica', 'Europa', 'Asia', 'América Latina'];
  platforms = [
    { name: 'Facebook', selected: false },
    { name: 'Instagram', selected: false },
    { name: 'TikTok', selected: false },
    { name: 'Twitter', selected: false },
    { name: 'LinkedIn', selected: false }
  ];
  employees = ['Juan Pérez', 'María Gómez', 'Luis Fernández'];

  // Control para el autocompletado de productos
  productControl = new FormControl();
  filteredProducts: Observable<string[]> = of([]);

  // Simulación de una lista grande de productos
  products: string[] = []; // Aquí irían los nombres de los 10,000 productos

  // Lista de promociones creadas
  promotionsList: Promotion[] = [];

  ngOnInit() {
    // Simular carga de productos
    for (let i = 1; i <= 10000; i++) {
      this.products.push(`Producto ${i}`);
    }

    this.filteredProducts = this.productControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterProducts(value || ''))
    );
  }

  private _filterProducts(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.products.filter(product =>
      product.toLowerCase().includes(filterValue)
    );
  }

  // Método para enviar la promoción
  submitPromotion() {
    // Asignar el producto seleccionado
    this.promotion.product = this.productControl.value;

    // Generar un ID único para la promoción
    this.promotion.id = Date.now();

    // Actualizar la lista de promociones
    this.promotionsList.push({ ...this.promotion });

    // Mostrar confirmación
    alert('¡La promoción ha sido enviada exitosamente!');

    // Reiniciar el formulario
    this.resetForm();
  }

  // Método para reiniciar el formulario
  resetForm() {
    this.promotion = {
      id: 0,
      title: '',
      product: '',
      offerType: '',
      content: '',
      regions: [],
      platforms: [],
      investment: 0,
      employee: '',
      publishDate: new Date()
    };
    this.productControl.reset();
    this.platforms.forEach(platform => (platform.selected = false));
  }

  // Método para actualizar las plataformas seleccionadas
  updatePlatforms() {
    this.promotion.platforms = this.platforms
      .filter(platform => platform.selected)
      .map(platform => platform.name);
  }

  // Método para manejar cambios en el tipo de oferta
  onOfferTypeChange() {
    if (this.promotion.offerType !== 'Descuento') {
      this.promotion.discountAmount = undefined;
    }
    if (this.promotion.offerType !== 'Promoción') {
      this.promotion.promotionDetails = undefined;
    }
  }

  // Método para mostrar detalles de una promoción (puedes expandir esto)
  viewPromotionDetails(promotion: Promotion) {
    alert(`Detalles de la promoción:\n${JSON.stringify(promotion, null, 2)}`);
  }
}
