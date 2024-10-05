import {Component, NgIterable, OnInit} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {KinguinService} from "../../../kinguin.service";
import {KinguinGiftCard} from "../../../models/KinguinGiftCard";

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    NgForOf,
    FormsModule,
    NgClass,
    NgIf,
    DatePipe,
    NgOptimizedImage
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
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
  constructor(private kinguinService: KinguinService){}

  ngOnInit(): void {
    this.getProducts()
  }

  getProducts(): void {
    this.kinguinService.getKinguinGiftCards(this.currentPage).subscribe((data: KinguinGiftCard[]) => {
      this.products = data.map(card => {
        // Asignar la imagen correcta a una propiedad común 'imageUrl'
        card.imageUrl = card.images?.cover?.thumbnail || card.coverImageOriginal || card.coverImage || 'assets/default-product.png';
        return card;
      });
      this.allProducts = this.products; // Almacenar todos los productos para filtrado local
    });
  }

  searchProducts(): void {
    if (this.searchQuery.trim() === '') {
      this.products = this.allProducts; // Si no hay búsqueda, devolver todos los productos
    } else {
      this.kinguinService.searchGiftCards(this.searchQuery).subscribe((data: KinguinGiftCard[]) => {
        this.products = data.map(card => {
          // Asegurar que las imágenes se asignen también en la búsqueda
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

  }

  showProductDetails(product: KinguinGiftCard) {
    this.selectedProduct = product;
  }

  hideProductDetails(product: KinguinGiftCard) {
    if (this.selectedProduct === product){
      this.selectedProduct = undefined;
    }
  }

  toggleProductDetails(product: KinguinGiftCard) {
    if (product == this.selectedProduct){
      this.selectedProduct = undefined;
    }
    else {
      this.selectedProduct = product;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getProducts();
    }
  }

  closeProductDetails() {

  }
}
