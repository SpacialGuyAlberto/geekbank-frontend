import {Component, NgIterable, OnInit} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {CurrencyPipe, DatePipe, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import {PromotionsService} from "./promotions.service";
import {MatSnackBarModule} from "@angular/material/snack-bar";


@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    DatePipe,
    CurrencyPipe,
    NgForOf,
    MatSnackBarModule,
    NgOptimizedImage
  ],
  templateUrl: './promotions.component.html',
  styleUrl: './promotions.component.css'
})
export class PromotionsComponent {
  isEditMode: boolean = false;
  isLoading: boolean = false;
  isModalOpen: boolean = false;
  searchPhoneNumber: string = '';
  searchCode: string = '';
  filteredPayments: (NgIterable<unknown> & NgIterable<any>) | undefined | null;
  payments: any;
  private _id: any;

  constructor(private promotionService: PromotionsService) {
    promotionService = this.promotionService;
  }

  openCreateModal() {

  }

  toggleConsumed(payment: any) {

  }

  toggleDifferenceRedeemed(payment: any) {

  }

  toggleVerified(payment: any) {

  }

  openEditModal(payment: any) {

  }

  createPromotion(){

  }

}
