import {Component, NgIterable, OnInit} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CurrencyPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {KinguinService} from "../../../kinguin.service";
import {id} from "ngx-charts/release/utils/id";
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
    NgIf
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
  selectedProduct: KinguinGiftCard | undefined;
  itemsPerPage: number = 20;
  currentPage: number = 1;
  totalPages: number = 0;
  // filteredProducts: (NgIterable<KinguinGiftCard> & NgIterable<any>) | undefined | null;
  constructor(private kinguinService: KinguinService){}

  ngOnInit(): void {
    this.getProducts()
  }

  getProducts() : void {
    this.kinguinService.getKinguinGiftCards(1).subscribe((data : KinguinGiftCard[]) => {
      this.products = data;
    })
  }

  get filteredProducts(){
    return this.products.filter(product => product.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
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

  goToPage(number: number) {

  }

  closeProductDetails() {

  }


}
