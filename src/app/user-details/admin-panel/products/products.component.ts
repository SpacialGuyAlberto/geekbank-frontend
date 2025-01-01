import { Component, OnInit } from '@angular/core';
import {FormGroup, FormsModule} from "@angular/forms";
import { KinguinService } from "../../../kinguin.service";
import { KinguinGiftCard } from "../../../models/KinguinGiftCard";
import {ActivationDetails, ActivationDetailsService} from "../../../activation-details.service";
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
@Component({
  selector: 'app-products',
  // standalone, imports, template, etc. como en tu código original...
  templateUrl: './products.component.html',
  standalone: true,
  imports: [
    NgClass,
    CurrencyPipe,
    DatePipe,
    FormsModule,
    NgForOf,
    NgIf
  ],
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  productForm: FormGroup | undefined;
  products: KinguinGiftCard[] = [];
  private _id: any;
  searchQuery: any = '';
  createNewProduct: any;
  allProducts: KinguinGiftCard[] = [];
  selectedProduct: KinguinGiftCard | undefined;
  itemsPerPage: number = 20;
  currentPage: number = 1;
  totalPages: number = 3309;

  // Campos para editar los Activation Details (puedes usar un FormGroup si gustas)
  activationVideoUrl = '';
  activationTextDetails = '';

  // Inyectamos nuestro nuevo servicio
  constructor(
    private kinguinService: KinguinService,
    private activationDetailsService: ActivationDetailsService
  ) {}

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts(): void {
    this.kinguinService.getKinguinGiftCards(this.currentPage).subscribe((data: KinguinGiftCard[]) => {
      this.products = data.map(card => {
        card.imageUrl = card.images?.cover?.thumbnail || card.coverImageOriginal || card.coverImage || 'assets/default-product.png';
        return card;
      });
      this.allProducts = this.products;
    });
  }

  searchProducts(): void {
    if (this.searchQuery.trim() === '') {
      this.products = this.allProducts;
    } else {
      this.kinguinService.searchGiftCards(this.searchQuery).subscribe((data: KinguinGiftCard[]) => {
        this.products = data.map(card => {
          card.imageUrl = card.images?.cover?.thumbnail || card.coverImageOriginal || card.coverImage || 'assets/default-product.png';
          return card;
        });
      });
    }
  }

  get filteredProducts() {
    return this.products;
  }

  editProduct(id: any) {
    this._id = id;
  }

  deleteProduct(id: any) {
    this._id = id;
  }

  addProduct() {
    // Lógica para añadir un nuevo producto (si fuera necesario).
  }

  // -------------------------------------------------------------------
  // Manejo de la tarjeta seleccionada y sus Activation Details
  // -------------------------------------------------------------------

  /**
   * Muestra u oculta los detalles del producto.
   * Además, podemos cargar los Activation Details desde el backend si existen.
   */
  toggleProductDetails(product: KinguinGiftCard) {
    if (product === this.selectedProduct) {
      // Si está abierto, lo cerramos
      this.selectedProduct = undefined;
    } else {
      // Cargamos detalles de activación para este kinguinId (product.id, product.productId, etc.).
      // Asegúrate de usar el kinguinId correcto (en tu modelo, revisa la propiedad que identifique al producto).
      this.selectedProduct = product;

      // Ejemplo: asumiendo que product.id === kinguinId. Ajusta si tu modelo difiere.
      this.activationDetailsService.getDetails(product.kinguinId).subscribe({
        next: (details: ActivationDetails) => {
          // Guardamos los valores para mostrarlos en inputs
          this.activationVideoUrl = details.videoUrl || '';
          this.activationTextDetails = details.textDetails || '';
        },
        error: (err) => {
          // 404 o no existe => no pasa nada, quizás dejamos vacíos los campos
          // console.error(err);
          this.activationVideoUrl = '';
          this.activationTextDetails = '';
        }
      });
    }
  }

  /**
   * Guarda (crea o actualiza) los Activation Details para el producto seleccionado.
   */
  saveActivationDetails(): void {
    if (!this.selectedProduct) return;

    const details: ActivationDetails = {
      kinguinId: this.selectedProduct.kinguinId, // Ajusta la propiedad si se llama distinto
      videoUrl: this.activationVideoUrl,
      textDetails: this.activationTextDetails
    };

    this.activationDetailsService.createOrUpdate(details).subscribe({
      next: (updated: ActivationDetails) => {
        alert('Detalles de activación guardados con éxito.');
        // Opcional: en caso de querer mostrarlo en pantalla
      },
      error: (err) => {
        alert('Ocurrió un error al guardar los detalles. Verifique permisos o datos.');
        console.error(err);
      }
    });
  }

  /**
   * Elimina los Activation Details asociados a este producto.
   */
  deleteActivationDetails(): void {
    if (!this.selectedProduct) return;

    if (!confirm('¿Seguro que deseas eliminar los detalles de activación?')) {
      return;
    }

    this.activationDetailsService.deleteDetails(this.selectedProduct.kinguinId).subscribe({
      next: () => {
        alert('Detalles de activación eliminados.');
        this.activationVideoUrl = '';
        this.activationTextDetails = '';
      },
      error: (err) => {
        alert('No se pudieron eliminar los detalles. Verifica permisos.');
        console.error(err);
      }
    });
  }

  closeProductDetails() {
    this.selectedProduct = undefined;
  }

  // -------------------------------------------------------------------
  // Paginación
  // -------------------------------------------------------------------
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getProducts();
    }
  }
}
