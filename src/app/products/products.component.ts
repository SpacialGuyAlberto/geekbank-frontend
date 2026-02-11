import { Component, ElementRef, OnInit, Renderer2, ViewChild, HostListener } from '@angular/core';
import { FormGroup, FormsModule } from "@angular/forms";
import { KinguinService } from "../kinguin-gift-cards/kinguin.service";
import { KinguinGiftCard } from "../kinguin-gift-cards/KinguinGiftCard";
import { ActivationDetails, ActivationDetailsService } from "../activation/activation-details.service";
import { CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf } from "@angular/common";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";

@Component({
    selector: 'app-products',
    templateUrl: './products.component.html',
    imports: [
        NgClass,
        CurrencyPipe,
        DatePipe,
        FormsModule,
        MatSnackBarModule,
        NgForOf,
        NgIf
    ],
    styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  productForm: FormGroup | undefined;
  products: KinguinGiftCard[] = [];
  private _id: any;
  searchQuery: string = '';
  createNewProduct: boolean = false;
  allProducts: KinguinGiftCard[] = [];
  selectedProduct: KinguinGiftCard | undefined;
  itemsPerPage: number = 20;
  currentPage: number = 1;
  totalPages: number = 3309;

  // Campos para editar los Activation Details
  activationVideoUrl: string = '';
  activationTextDetails: string = '';

  // Referencias a elementos del DOM
  @ViewChild('resizer', { static: true }) resizer!: ElementRef;
  @ViewChild('productsList', { static: true }) productsList!: ElementRef;

  private dragging: boolean = false;
  private startX: number = 0;
  private startWidth: number = 0;

  constructor(
    private kinguinService: KinguinService,
    private activationDetailsService: ActivationDetailsService,
    private snackBar: MatSnackBar,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.getProducts();

    // Escuchar el evento mousedown en el resizer
    const resizer = this.resizer.nativeElement;
    this.renderer.listen(resizer, 'mousedown', (event: MouseEvent) => {
      this.dragging = true;
      this.startX = event.clientX;
      this.startWidth = this.productsList.nativeElement.offsetWidth;
      // Cambiar el cursor globalmente
      this.renderer.setStyle(document.body, 'cursor', 'ew-resize');
    });
  }

  // Escuchar eventos de mousemove y mouseup en el documento
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.dragging) {
      const dx = event.clientX - this.startX;
      const newWidth = this.startWidth + dx;

      const minWidth = 200;
      const maxWidth = 600;

      if (newWidth > minWidth && newWidth < maxWidth) {
        this.renderer.setStyle(this.productsList.nativeElement, 'flex', `0 0 ${newWidth}px`);
      }
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    if (this.dragging) {
      this.dragging = false;
      this.renderer.setStyle(document.body, 'cursor', 'default');
    }
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
    this.createNewProduct = true;
  }

  toggleProductDetails(product: KinguinGiftCard) {
    if (product === this.selectedProduct) {

      this.selectedProduct = undefined;
    } else {
      this.selectedProduct = product;
      this.activationDetailsService.getDetails(product.kinguinId).subscribe({
        next: (details: ActivationDetails) => {
          this.activationVideoUrl = details.videoUrl || '';
          this.activationTextDetails = details.textDetails || '';
        },
        error: (err) => {
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
        this.snackBar.open('Detalles de activacion guardados con exito.', 'Cerrar', {
          duration: 3000,
        });
      },
      error: (err) => {
        this.snackBar.open('Ocurrio un error al guardar los detalles de activacion.', 'Cerrar', {
          duration: 3000,
        });
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

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getProducts();
    }
  }
}
