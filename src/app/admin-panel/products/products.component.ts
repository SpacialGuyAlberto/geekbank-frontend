import { Component } from '@angular/core';
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {CurrencyPipe, NgForOf} from "@angular/common";

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    NgForOf
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  productForm: FormGroup | undefined;
  products: any;
  private _id: any;


  saveProduct() {

  }

  editProduct(id: any) {
    this._id = id;

  }

  deleteProduct(id: any) {
    this._id = id;

  }
}
